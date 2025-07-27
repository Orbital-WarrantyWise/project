import { supabase } from '@/helpers/supabase';
import type { Tables } from 'warrantywise-database/database.types';
import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, FlatList, StyleSheet } from 'react-native';
import { showMessage } from 'react-native-flash-message';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { dateTimeFormatter } from '@/helpers/utils';

const TABLE_HEADERS = ['Name', 'Description', 'Categories', 'Price', 'Purchase Date', 'Expiry Date'];

export default function WarrantySearchPage() {
  // TODO: Add debouncing for nameQuery
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredWarranties, setFilteredWarranties] = useState<Tables<'warranties'>[]>();

  useEffect(() => {
    const search = async () => {
      const { data, error } = await supabase.from('warranties').select();
      if (error) {
        showMessage({ type: 'danger', message: `Failed to Load Warranties! [${error.name}: ${error.message}]` });
        return;
      }

      // Perform client-side filtering since difficult to search via supabase, can't convert columns to strings for whatever reason...
      const query = searchQuery.trim().toLowerCase();
      const newFilteredWarranties = data.filter(item => {
        const searchText = [
          item.name,
          item.description,
          item.categories ? item.categories?.join(',') : '',
          item.price as string,
          dateTimeFormatter.format(new Date(item.purchase_date)),
          dateTimeFormatter.format(new Date(item.expiration_date)),
        ]
          .join(';')
          .toLowerCase();
        return searchText.includes(query);
      });
      setFilteredWarranties(newFilteredWarranties);
    };
    search();
  }, [searchQuery]);

  return (
    <View style={styleSheet.container}>
      <Text style={styleSheet.heading}>Search Warranties</Text>
      <TextInput
        style={styleSheet.input}
        placeholder="Search by name, description, category, or price"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <SafeAreaProvider>
        <SafeAreaView style={styleSheet.scrollableView}>
          <FlatList
            data={filteredWarranties}
            ListHeaderComponent={() => (
              <View style={styleSheet.table_row}>
                {TABLE_HEADERS.map(header => (
                  <Text key={header} style={[styleSheet.table_cell, styleSheet.bold_cell]}>
                    {header}
                  </Text>
                ))}
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
              </View>
            )}
            keyExtractor={item => item.id.toString()}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </View>
  );
}

const styleSheet = StyleSheet.create({
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
