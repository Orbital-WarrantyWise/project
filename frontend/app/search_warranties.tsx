import { getSession } from '@/helpers/storage';
import type { Warranty } from '@/helpers/types';
import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, FlatList, StyleSheet } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const TABLE_HEADERS = [
  { key: 'id', label: 'ID' },
  { key: 'product_name', label: 'Product Name' },
  { key: 'product_categories', label: 'Product Categories' },
  { key: 'purchase_date', label: 'Purchase Date' },
  { key: 'expiration_date', label: 'Expiry Date' },
];

export default function WarrantySearchPage() {
  // TODO: Add debouncing for nameQuery
  const [nameQuery, setNameQuery] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [warranties, setWarranties] = useState<Warranty[]>();

  useEffect(() => {
    const search = async () => {
      if (submitLoading) return;
      const access_token = await getSession('SUPABASE_ACCESS_TOKEN');
      if (access_token === null) {
        showMessage({
          type: 'danger',
          message: 'Missing Access Token! Login First!',
        });
        return;
      }

      setSubmitLoading(true);
      const data = {
        product_name: nameQuery,
      };
      console.log('Form Data is', data);
      const res = await fetch(process.env.EXPO_PUBLIC_BACKEND_BASE_URL + '/warranty/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          SUPABASE_ACCESS_TOKEN: access_token,
        },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      console.log('Backend Response is', res.status, json);
      if (!json['success']) {
        showMessage({ type: 'danger', message: 'Failed to Search Warranty!' });
      }
      setWarranties(json['data']);
      setSubmitLoading(false);
    };
    search();
  }, [nameQuery]);

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
  });

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Search Warranties</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter product name..."
        value={nameQuery}
        onChangeText={setNameQuery}
      />

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
              </View>
            )}
            renderItem={({ item }) => (
              <View style={styleSheet.table_row}>
                <Text style={styleSheet.table_cell}>{item.id}</Text>
                <Text style={styleSheet.table_cell}>{item.product_name}</Text>
                <Text style={styleSheet.table_cell}>{item.product_categories.join(',')}</Text>
                <Text style={styleSheet.table_cell}>{item.purchase_date}</Text>
                <Text style={styleSheet.table_cell}>{item.expiration_date}</Text>
              </View>
            )}
            keyExtractor={item => item.id.toString()}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    flex: 1,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#aaa',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  result: {
    fontSize: 18,
    paddingVertical: 8,
  },
  noResults: {
    fontStyle: 'italic',
    color: 'gray',
    marginTop: 10,
  },
});
