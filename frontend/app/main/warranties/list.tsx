import { StyleSheet, View, FlatList, Text, Button, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import type { Tables } from 'warrantywise-database/database.types';
import { useRouter } from 'expo-router';
import Markdown from 'react-native-markdown-display';
import { supabase } from '@/helpers/supabase';
import { dateTimeFormatter } from '@/helpers/utils';

const TABLE_HEADERS = ['Name', 'Description', 'Categories', 'Price', 'Purchase Date', 'Expiry Date'];

export default function GetWarranties() {
  const [sortedWarranties, setSortedWarranties] = useState<Tables<'warranties'>[]>([]);
  const [sortedColumn, setSortedColumn] = useState<string>();
  const [sortDirection, setSortDirection] = useState<string>();
  const [aiRecommendation, setAiRecommendation] = useState<string>();
  const [showAIRecommendationPopup, setShowAIRecommendationPopup] = useState(false);
  const [aiRecommendationLoading, setAiRecommendationLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from('warranties').select();
      if (error) {
        showMessage({ type: 'danger', message: `Failed to load warranties! [${error.name}: ${error.message}]` });
        return;
      } else {
        setSortedWarranties(data); // Display this instead of warranties
      }
    };
    load();
  }, []);

  const getSortKey = (item: any, column: string) => {
    if (column === 'Name') {
      return item.name;
    } else if (column === 'Description') {
      return item.description;
    } else if (column === 'Categories') {
      return item.categories;
    } else if (column === 'Price') {
      return parseFloat((item.price as string).substring(1).replace(/,/g, ''));
    } else if (column === 'Purchase Date') {
      return item.purchase_date;
    } else if (column === 'Expiry Date') {
      return item.expiration_date;
    }
    return null;
  };

  const sortRows = (column: string) => {
    let direction = 'asc'; // Sort in ascending by default
    if (sortedColumn && sortedColumn === column && sortDirection === 'asc') {
      // Clicking on same column means toggle from ascending to descending
      direction = 'desc';
    }
    setSortedColumn(column);
    setSortDirection(direction);

    const newSortedWarranties = [...sortedWarranties].sort((x, y) => {
      const xVal = getSortKey(x, column);
      const yVal = getSortKey(y, column);

      // No clue why, but apparently typescript doesn't have native support for a sort direction parameter
      if (xVal < yVal) return direction === 'asc' ? -1 : 1;
      if (xVal > yVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    //console.log(newSortedWarranties);
    setSortedWarranties(newSortedWarranties);
  };

  const getSortIndicator = (column: string) => {
    if (!sortedColumn || sortedColumn !== column) return '↕️'; // This column is not currently being sorted
    return sortDirection === 'asc' ? '⬆️' : '⬇️';
  };

  const openAIRecommendationPopup = async (item: Tables<'warranties'>) => {
    if (aiRecommendationLoading) return; // Prevents wastage of tokens as well
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session === null) {
      showMessage({
        type: 'danger',
        message: 'Missing Access Token! Login First!',
      });
      return;
    }
    const { access_token } = session;

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
        name: item.name,
        description: item.description,
        categories: item.categories,
        price: parseFloat((item.price as string).substring(1).replace(/,/g, '')),
        purchase_date: item.purchase_date + 'Z',
      }),
    });

    const json = await res.json();
    if (json['success']) {
      setAiRecommendation(json['data']);
      showMessage({
        type: 'success',
        message: 'Successfully fetched AI Recommendation!',
      });
    } else {
      showMessage({
        type: 'danger',
        message: `Error fetching AI Recommendation: ${json['error']}`,
      });
    }

    setAiRecommendationLoading(false);
    setShowAIRecommendationPopup(true);
  };

  const closeAIRecommendationPopup = () => {
    setShowAIRecommendationPopup(false);
    setAiRecommendation('');
  };

  return (
    <View style={styleSheet.scrollableView}>
      <SafeAreaProvider>
        <SafeAreaView style={styleSheet.scrollableView}>
          <FlatList
            data={sortedWarranties}
            ListHeaderComponent={() => (
              <View style={styleSheet.table_row}>
                {TABLE_HEADERS.map(header => (
                  <TouchableOpacity key={header} style={styleSheet.table_cell} onPress={() => sortRows(header)}>
                    <Text key={header} style={[styleSheet.table_cell, styleSheet.bold_cell]}>
                      {header}
                      {getSortIndicator(header)}
                    </Text>
                  </TouchableOpacity>
                ))}
                <Text style={[styleSheet.table_cell, styleSheet.bold_cell]}>Edit</Text>
                <Text style={[styleSheet.table_cell, styleSheet.bold_cell]}>AI Recommendation</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <View style={styleSheet.table_row}>
                <Text style={styleSheet.table_cell}>{item.name}</Text>
                <Text style={styleSheet.table_cell}>{item.description}</Text>
                <Text style={styleSheet.table_cell}>{item.categories ? item.categories?.join(',') : ''}</Text>
                <Text style={styleSheet.table_cell}>{item.price as string}</Text>
                <Text style={styleSheet.table_cell}>{dateTimeFormatter.format(new Date(item.purchase_date))}</Text>
                <Text style={styleSheet.table_cell}>{dateTimeFormatter.format(new Date(item.expiration_date))}</Text>
                <View style={styleSheet.table_cell}>
                  <Button
                    title="Edit"
                    onPress={() => {
                      router.navigate({
                        pathname: '/main/warranties/[warrantyId]',
                        params: { warrantyId: item.id },
                      });
                    }}
                  />
                </View>
                <View style={styleSheet.table_cell}>
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
