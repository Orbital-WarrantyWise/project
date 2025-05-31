import { StyleSheet, View, Text, TextInput, Button } from "react-native";
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

  const handleSubmitButton = async () => {
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

  const styleSheet = StyleSheet.create({
    textLabel: {
      marginBottom: 5,
    },
    textInput: {
      marginBottom: 15,
      borderWidth: 1,
    },
    datePickerButtonViewWrapper: {
      marginBottom: 15,
    },
    submitButtonViewWrapper: {
      marginTop: 15,
    },
  });

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={styleSheet.textLabel}>Product Name:</Text>
      <TextInput style={styleSheet.textInput}
        value={productName}
        onChangeText={setProductName}
        placeholder="Laptop"
        placeholderTextColor="#808080"
      />

      <Text style={styleSheet.textLabel}>Product Categories (Comma-Separated):</Text>
      <TextInput style={styleSheet.textInput}
        value={productCategories}
        onChangeText={setProductCategories}
        placeholder="Electonics,Software"
        placeholderTextColor="#808080"
      />

      <Text style={styleSheet.textLabel}>Purchase Date:</Text>
      <View style={styleSheet.datePickerButtonViewWrapper}>
        <Button title={formatDate(purchaseDate)} onPress={() => {
          setOpenPurchaseDatePicker(true);
        }}/>
      </View>
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

      <Text style={styleSheet.textLabel}>Expiration Date:</Text>
      <View style={styleSheet.datePickerButtonViewWrapper}>
        <Button title={formatDate(expirationDate)} onPress={() => {
          setOpenExpirationDatePicker(true);
        }}/>
      </View>
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

      <View style={styleSheet.submitButtonViewWrapper}>
        <Button title="Add Warranty" onPress={handleSubmitButton} />
      </View>
    </View>
  );
}
