import { View, Text, TextInput, Button } from "react-native";
import { useState } from 'react';
import { DatePickerModal } from "react-native-paper-dates"; // Tried https://github.com/react-native-datetimepicker/datetimepicker and https://github.com/mmazzarolo/react-native-modal-datetime-picker, but both don't work on Web
import { format } from 'date-fns';

export default function AddWarranty() {
  const [productName, setProductName] = useState('');
  const [productCategories, setProductCategories] = useState('');
  const [openPurchaseDatePicker, setOpenPurchaseDatePicker] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [openExpirationDatePicker, setOpenExpirationDatePicker] = useState(false);
  const [expirationDate, setExpirationDate] = useState(new Date());

  const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd'); // Ref: https://date-fns.org/docs/format
  };

  const handleButton = async () => {
    const data = {
      product_name: productName,
      product_categories: productCategories.split(','),
      purchase_date: formatDate(purchaseDate),
      expiration_date: formatDate(expirationDate),
    };
    console.log('Form Data is', data);
    const res = await fetch(process.env.EXPO_PUBLIC_BACKEND_BASE_URL + "/warranty", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    console.log('Backend Response is', res.status, json);
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
        placeholderTextColor="#808080"
        style={{ borderWidth: 1 }}
      />

      <Text>Product Categories (Comma-Separated):</Text>
      <TextInput
        value={productCategories}
        onChangeText={setProductCategories}
        placeholder="Electonics,Software"
        placeholderTextColor="#808080"
        style={{ borderWidth: 1 }}
      />

      <Text>Purchase Date:</Text>
      <Button title={formatDate(purchaseDate)} onPress={() => {
        setOpenPurchaseDatePicker(true);
      }}/>
      <DatePickerModal
          locale="en"
          mode="single"
          visible={openPurchaseDatePicker}
          onDismiss={() => {
            setOpenPurchaseDatePicker(false);
          }}
          date={purchaseDate}
          onConfirm={(params: any) => {
            console.log("PurchaseDatePicker", params)
            setOpenPurchaseDatePicker(false);
            setPurchaseDate(params.date);
          }}
      />

      <Text>Expiration Date:</Text>
      <Button title={formatDate(expirationDate)} onPress={() => {
        setOpenExpirationDatePicker(true);
      }}/>
      <DatePickerModal
          locale="en"
          mode="single"
          visible={openExpirationDatePicker}
          onDismiss={() => {
            setOpenExpirationDatePicker(false);
          }}
          date={expirationDate}
          onConfirm={(params: any) => {
            console.log("ExpirationDatePicker", params)
            setOpenExpirationDatePicker(false);
            setExpirationDate(params.date);
          }}
      />

      <Button title="Add Warranty" onPress={handleButton} />
    </View>
  );
}
