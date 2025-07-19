import { StyleSheet, View, Text, TextInput, Button, ActivityIndicator, Image, Platform, Modal } from 'react-native';
import { useState } from 'react';
import { DatePickerModal } from 'react-native-paper-dates'; // Tried https://github.com/react-native-datetimepicker/datetimepicker and https://github.com/mmazzarolo/react-native-modal-datetime-picker, but both don't work on Web
import { format } from 'date-fns';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/helpers/supabase';
import { decode } from 'base64-arraybuffer';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function AddWarranty() {
  const [productName, setProductName] = useState('');
  const [productCategories, setProductCategories] = useState('');
  const [openPurchaseDatePicker, setOpenPurchaseDatePicker] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [openExpirationDatePicker, setOpenExpirationDatePicker] = useState(false);
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [submitLoading, setSubmitLoading] = useState(false);
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [showOCRPopup, setShowOCRPopup] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd'); // Ref: https://date-fns.org/docs/format
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
      exif: true,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setShowOCRPopup(true);
    }
  };

  const closeOCRPopup = () => {
    setShowOCRPopup(false);
  };

  const handleOCRButton = async () => {
    if (ocrLoading || !image) return; // Just in case
    // Ensure image size is less than 5 MB
    if (image && image.fileSize && image.fileSize >= MAX_IMAGE_SIZE) {
      showMessage({ type: 'danger', message: 'Image exceeds 5MB, please use a smaller image!' });
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session == null) {
      showMessage({
        type: 'danger',
        message: 'Missing Access Token! Login First!',
      });
      return;
    }
    const { access_token } = session;

    setOcrLoading(true);

    const res = await fetch(process.env.EXPO_PUBLIC_BACKEND_BASE_URL + '/ai/ocr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        SUPABASE_ACCESS_TOKEN: access_token,
      },
      body: JSON.stringify({
        b64Image: image.base64,
        mimeType: image.mimeType,
      }),
    });

    const json = await res.json();
    console.log("Backend Response", json)
    if (json['success']) {
      const jsonData = json["data"] // TODO: Purchase date, description, warranty duration
      setProductName(jsonData["product_name"])
      setPurchaseDate(new Date(jsonData["purchase_date"]))
      showMessage({
        type: 'success',
        message: 'Successfully fetched AI OCR!',
      });
    } else {
      showMessage({
        type: 'danger',
        message: `Error fetching AI OCR: ${json['error']}`,
      });
    }
    setOcrLoading(false);
    closeOCRPopup();
  }

  const handleSubmitButton = async () => {
    if (submitLoading) return; // Just in case
    // Ensure image size is less than 5 MB
    if (image && image.fileSize && image.fileSize >= MAX_IMAGE_SIZE) {
      showMessage({ type: 'danger', message: 'Image exceeds 5MB, please use a smaller image!' });
      return;
    }

    setSubmitLoading(true);

    const data = {
      product_name: productName,
      product_categories: productCategories.split(','), // TODO: Also handle whitespaces
      purchase_date: formatDate(purchaseDate),
      expiration_date: formatDate(expirationDate),
      user_id: (await supabase.auth.getUser()).data.user?.id,
    };
    console.log('Form Data is', data);
    const { data: warranty, error } = await supabase.from('warranties').insert(data).select().single();
    if (error) {
      showMessage({ type: 'danger', message: 'Failed to Add Warranty!' });
    } else {
      if (image) {
        let res;
        if (Platform.OS === 'web') {
          const fileExt = image.file!.name.split('.').pop();
          res = await supabase.storage
            .from('images')
            .upload(`${(await supabase.auth.getUser()).data.user?.id}/${warranty.id}.${fileExt}`, image.file!);
        } else {
          const fileExt = image.uri.split('.').pop();
          res = await supabase.storage
            .from('images')
            .upload(
              `${(await supabase.auth.getUser()).data.user?.id}/${warranty.id}.${fileExt}`,
              decode(image.base64!),
              {
                contentType: image.mimeType,
              },
            );
        }
        // TODO: Handle error if uploading to storage fails
        console.log(res.error);
      }
      showMessage({ type: 'success', message: 'Successfully Added Warranty!' });
    }
    setSubmitLoading(false);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={styleSheet.textLabel}>Warranty images:</Text>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && <Image source={{ uri: image.uri }} style={styleSheet.image} />}

      <Text style={styleSheet.textLabel}>Product Name:</Text>
      <TextInput
        style={styleSheet.textInput}
        value={productName}
        onChangeText={setProductName}
        placeholder="Laptop"
        placeholderTextColor="#808080"
      />

      <Text style={styleSheet.textLabel}>Product Categories (Comma-Separated):</Text>
      <TextInput
        style={styleSheet.textInput}
        value={productCategories}
        onChangeText={setProductCategories}
        placeholder="Electronics,Software"
        placeholderTextColor="#808080"
      />

      <Text style={styleSheet.textLabel}>Purchase Date:</Text>
      <View style={styleSheet.datePickerButtonViewWrapper}>
        <Button
          title={formatDate(purchaseDate)}
          onPress={() => {
            setOpenPurchaseDatePicker(true);
          }}
        />
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
          console.log('PurchaseDatePicker', params);
          setOpenPurchaseDatePicker(false);
          setPurchaseDate(params.date);
        }}
      />

      <Text style={styleSheet.textLabel}>Expiration Date:</Text>
      <View style={styleSheet.datePickerButtonViewWrapper}>
        <Button
          title={formatDate(expirationDate)}
          onPress={() => {
            setOpenExpirationDatePicker(true);
          }}
        />
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
          console.log('ExpirationDatePicker', params);
          setOpenExpirationDatePicker(false);
          setExpirationDate(params.date);
        }}
      />

      <View style={styleSheet.submitButtonViewWrapper}>
        {submitLoading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Button title="Add Warranty" onPress={handleSubmitButton} />
        )}
      </View>

      <Modal visible={showOCRPopup} onRequestClose={closeOCRPopup} transparent={true}>
        <View style={styleSheet.modal_overlay}>
          <View style={styleSheet.popup_window}>
            <Text style={styleSheet.popup_title}>AI OCR</Text>
            <Text>Would you like to use AI OCR to automatically extract warranty details from this image?</Text>
            {ocrLoading ? (
              <ActivityIndicator size="small" />
            ) : (
              <View style={styleSheet.button_container}>
                <Button title="Yes" onPress={handleOCRButton} />
                <Button title="No" onPress={closeOCRPopup} />
              </View>
            )}
          </View>
        </View>
      </Modal>

      <FlashMessage position="top" />
    </View>
  );
}

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
  image: {
    width: 200,
    height: 200,
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
  button_container: {
    flexDirection: 'row', // Make 2 buttons side-by-side in the same row
    justifyContent: 'space-around', // Spread 2 buttons apart
  },
});
