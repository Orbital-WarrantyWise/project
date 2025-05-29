import { View, Text, TextInput, Button } from "react-native";
import { useState } from 'react';

export default function AddWarranty() {
  const [productName, setProductName] = useState('');
  const [productCategories, setProductCategories] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [expirationDate, setExpirationDate] = useState('');

  const handleButton = () => {
    const data = {
      product_name: productName,
      product_categories: productCategories.split(','),
      purchase_date: purchaseDate,
      expiration_date: expirationDate,
    };
    console.log('Form Data is', data);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Product Name:</Text>
      <TextInput
        value={productName}
        onChangeText={setProductName}
        placeholder="Laptop"
        style={{ borderWidth: 1 }}
      />

      <Text>Product Categories (Comma-Separated):</Text>
      <TextInput
        value={productCategories}
        onChangeText={setProductCategories}
        placeholder="Electonics,Software"
        style={{ borderWidth: 1 }}
      />

      <Text>Purchase Date:</Text>
      <TextInput
        value={purchaseDate}
        onChangeText={setPurchaseDate}
        placeholder="YYYY-MM-DD"
        style={{ borderWidth: 1 }}
      />

      <Text>Expiration Date:</Text>
      <TextInput
        value={expirationDate}
        onChangeText={setExpirationDate}
        placeholder="YYYY-MM-DD"
        style={{ borderWidth: 1 }}
      />

      <Button title="Add Warranty" onPress={handleButton} />
    </View>
  );
}
