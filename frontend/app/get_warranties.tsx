import { StyleSheet, View, Button, FlatList, Text } from "react-native";
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useState } from "react";

interface Warranty {
  id: number;
  created_at: string;
  product_name: string;
  product_categories: string[];
  purchase_date: string;
  expiration_date: string;
}

const TABLE_HEADERS = [
  { key: 'id', label: 'ID' },
  { key: 'product_name', label: 'Product Name' },
  { key: 'product_categories', label: 'Product Categories' },
  { key: 'purchase_date', label: 'Purchase Date' },
  { key: 'expiration_date', label: 'Expiry Date' },
];

export default function GetWarranties() {
  const [warranties, setWarranties] = useState<Warranty[]>();

  const handleLoadButton = async () => {
    console.log('Sending Request to Backend...')
    const res = await fetch(process.env.EXPO_PUBLIC_BACKEND_BASE_URL + "/warranty", {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await res.json();
    console.log('Backend Response is', res.status, json);
    setWarranties(json["data"]);
  };

  const styleSheet = StyleSheet.create({
    scrollableView: {
      flex: 1, // Needed to ensure view is scrollable
    },
    table_row: {
      flex: 1, // Needed to draw table column lines correctly
      flexDirection: 'row', // Overflow <Text> blocks horizontally instead of vertically
      borderBottomWidth: 1 // Only draw bottom border to prevent overlap
    },
    table_cell: {
      flex: 1, // Needed to draw table column lines correctly
      borderRightWidth: 1, // Only draw right border to prevent overlap
      padding: 5,
      textAlign: 'center'
    },
    bold_cell: {
      fontWeight: 'bold'
    }
  });

  return (
    <View style={styleSheet.scrollableView}>
      <Button title="Load" onPress={handleLoadButton} />
      <SafeAreaProvider>
        <SafeAreaView style={styleSheet.scrollableView}>
          <FlatList
            data={warranties}
            ListHeaderComponent={() => (
              <View style={styleSheet.table_row}>
                {
                  TABLE_HEADERS.map((col) => (
                    <Text style={[styleSheet.table_cell, styleSheet.bold_cell]}>{col.label}</Text>
                  ))
                }
              </View>
            )}
            renderItem={({item}) => (
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
