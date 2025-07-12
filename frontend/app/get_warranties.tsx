import { StyleSheet, View, FlatList, Text, Button, Modal, ScrollView } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { getSession } from '@/helpers/storage';
import type { Warranty } from '@/helpers/types';
import { useRouter } from 'expo-router';
import Markdown from 'react-native-markdown-display';

const TABLE_HEADERS = [
  { key: 'product_name', label: 'Product Name' },
  { key: 'product_categories', label: 'Product Categories' },
  { key: 'purchase_date', label: 'Purchase Date' },
  { key: 'expiration_date', label: 'Expiry Date' },
];

export default function GetWarranties() {
  const [warranties, setWarranties] = useState<Warranty[]>();
  const [initLoading, setInitLoading] = useState(false);
  const [aiRecommendation, setAiRecommendation] = useState<string>();
  const [showAIRecommendationPopup, setShowAIRecommendationPopup] = useState(false);
  const [aiRecommendationLoading, setAiRecommendationLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      if (initLoading) return; // Just in case
      const access_token = await getSession('SUPABASE_ACCESS_TOKEN');
      if (access_token == null) {
        showMessage({
          type: 'danger',
          message: 'Missing Access Token! Login First!',
        });
        return;
      }

      setInitLoading(true);
      console.log('Sending Request to Backend...');
      const res = await fetch(process.env.EXPO_PUBLIC_BACKEND_BASE_URL + '/warranty', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          SUPABASE_ACCESS_TOKEN: access_token,
        },
      });
      const json = await res.json();
      console.log('Backend Response is', res.status, json);
      setWarranties(json['data']);
      setInitLoading(false);
    };
    load();
  }, []);

  const openAIRecommendationPopup = async (item: Warranty) => {
    if (aiRecommendationLoading) return; // Prevents wastage of tokens as well
    const access_token = await getSession('SUPABASE_ACCESS_TOKEN');
    if (access_token == null) {
      showMessage({
        type: 'danger',
        message: 'Missing Access Token! Login First!',
      });
      return;
    }

    setAiRecommendationLoading(true);
    showMessage({
      type: 'info',
      message: 'Generating AI Recommendation, please wait up to 1 min...',
    });
    const res = await fetch(process.env.EXPO_PUBLIC_BACKEND_BASE_URL + '/ai/recommendation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        SUPABASE_ACCESS_TOKEN: access_token,
      },
      body: JSON.stringify({
        product_name: item.product_name,
        product_description: '', // TODO: Add this field to Warranty schema
        product_categories: item.product_categories,
        purchase_date: item.purchase_date,
      }),
    });

    const json = await res.json();
    setAiRecommendationLoading(false);
    setShowAIRecommendationPopup(true);
    setAiRecommendation(json['data']);
  };

  const closeAIRecommendationPopup = () => {
    setShowAIRecommendationPopup(false);
    setAiRecommendation('');
  };

  const styleSheet = StyleSheet.create({
    scrollableView: {
      flex: 1, // Needed to ensure view is scrollable
    },
    table_row: {
      flex: 1, // Needed to draw table column lines correctly
      flexDirection: 'row', // Overflow <Text> blocks horizontally instead of vertically
      borderBottomWidth: 1, // Only draw bottom border to prevent overlap
    },
    table_cell: {
      flex: 1, // Needed to draw table column lines correctly
      borderRightWidth: 1, // Only draw right border to prevent overlap
      padding: 5,
      textAlign: 'center',
    },
    bold_cell: {
      fontWeight: 'bold',
    },
    modal_overlay: {
      flex: 1, // Needed to display correctly
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dim the original background
      justifyContent: 'center',
      alignItems: 'center',
    },
    popup_window: {
      backgroundColor: '#ffffff', // White popup background
      padding: 20,
      borderRadius: 10, // Makes border look rounded and nicer
      width: '80%', // Prevent popup from completely covering background
      maxHeight: '80%', // Prevent popup from completely covering background
    },
    popup_title: {
      textAlign: 'center',
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styleSheet.scrollableView}>
      <SafeAreaProvider>
        <SafeAreaView style={styleSheet.scrollableView}>
          <FlatList
            data={warranties}
            ListHeaderComponent={() => (
              <View style={styleSheet.table_row}>
                {TABLE_HEADERS.map(col => (
                  <Text key={col.key} style={[styleSheet.table_cell, styleSheet.bold_cell]}>
                    {col.label}
                  </Text>
                ))}
                <Text style={[styleSheet.table_cell, styleSheet.bold_cell]}>Edit</Text>
                <Text style={[styleSheet.table_cell, styleSheet.bold_cell]}>AI Recommendation</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={styleSheet.table_row}>
                <Text style={styleSheet.table_cell}>{item.product_name}</Text>
                <Text style={styleSheet.table_cell}>{item.product_categories.join(',')}</Text>
                <Text style={styleSheet.table_cell}>{item.purchase_date}</Text>
                <Text style={styleSheet.table_cell}>{item.expiration_date}</Text>
                <View>
                  <Button
                    title="Edit"
                    onPress={() => {
                      router.navigate({
                        pathname: '/warranty/[warrantyId]',
                        params: { warrantyId: item.id },
                      });
                    }}
                  />
                </View>
                <View>
                  <Button
                    title="AI Recommendation"
                    onPress={() => {
                      openAIRecommendationPopup(item);
                    }}
                    disabled={aiRecommendationLoading}
                  />
                </View>
              </View>
            )}
            keyExtractor={item => item.id.toString()}
          />
          <Modal visible={showAIRecommendationPopup} onRequestClose={closeAIRecommendationPopup} transparent={true}>
            <View style={styleSheet.modal_overlay}>
              <View style={styleSheet.popup_window}>
                <Text style={styleSheet.popup_title}>AI Recommendation</Text>
                <ScrollView>
                  <Markdown>{aiRecommendation}</Markdown>
                </ScrollView>
                <Button title="Close" onPress={closeAIRecommendationPopup} />
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </SafeAreaProvider>

      <FlashMessage position="top" />
    </View>
  );
}
