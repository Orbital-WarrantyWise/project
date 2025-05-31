import { View, Button, FlatList, Text } from "react-native";
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

export default function GetWarranties() {
  const [warranties, setWarranties] = useState<Warranty[]>();

  const handleButton = async () => {
    console.log('Sending Request to Backend...')
    const res = await fetch(process.env.EXPO_PUBLIC_BACKEND_BASE_URL + "/warranty", {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await res.json();
    console.log('Backend Response is', res.status, json);
    setWarranties(json["data"]);
  };

  return (
    <View>
      <Button title="Load" onPress={handleButton} />
      <SafeAreaProvider>
        <SafeAreaView>
          <FlatList
            data={warranties}
            renderItem={({item}) => (
                <Text>{item.id} {item.product_name} {item.product_categories} {item.purchase_date} {item.expiration_date}</Text>
            )}
            keyExtractor={item => item.id.toString()}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    </View>
  );
}
