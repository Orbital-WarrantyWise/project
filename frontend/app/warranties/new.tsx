import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Image,
  Platform,
  Modal,
  ScrollView,
} from 'react-native';
import { useState } from 'react';
import { DatePickerModal } from 'react-native-paper-dates'; // Tried https://github.com/react-native-datetimepicker/datetimepicker and https://github.com/mmazzarolo/react-native-modal-datetime-picker, but both don't work on Web
import { format } from 'date-fns';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/helpers/supabase';
import { decode } from 'base64-arraybuffer';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const tempName = `temp-${Date.now()}`;

export default function AddWarranty() {
  // TODO: Handle organisationId in search params
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState('');
  const [price, setPrice] = useState('');
  const [openPurchaseDatePicker, setOpenPurchaseDatePicker] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [openExpirationDatePicker, setOpenExpirationDatePicker] = useState(false);
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fileExt, setFileExt] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [showOCRPopup, setShowOCRPopup] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);

  const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd'); // Ref: https://date-fns.org/docs/format
  };

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
      exif: true,
      base64: true,
    });

    // Don't do anything if user closes image picker
    if (result.canceled) return;

    // Ensure file is an image and image size is less than 5 MB
    const image = result.assets[0];
    if (!image.file!) {
      showMessage({ type: 'danger', message: "Couldn't load image!" });
      return;
    }
    if (image && image.fileSize && image.fileSize >= MAX_IMAGE_SIZE) {
      showMessage({ type: 'danger', message: 'Image exceeds 5MB, please use a smaller image!' });
      return;
    }

    // Upload image to Supabase bucket as temp file
    const userId = (await supabase.auth.getUser()).data.user?.id;
    let fileExt;
    let res;
    if (Platform.OS === 'web') {
      fileExt = image.file!.name.split('.').pop();
      if (!fileExt) {
        showMessage({ type: 'danger', message: "Couldn't extract file extension from image!" });
        return;
      }
      res = await supabase.storage.from('images').upload(`${userId}/${tempName}.${fileExt}`, image.file!, {
        upsert: true,
      });
    } else {
      fileExt = image.uri.split('.').pop();
      if (!fileExt) {
        showMessage({ type: 'danger', message: "Couldn't extract file extension from image!" });
        return;
      }
      res = await supabase.storage.from('images').upload(`${userId}/${tempName}.${fileExt}`, decode(image.base64!), {
        upsert: true,
        contentType: image.mimeType,
      });
    }
    if (res.error) {
      showMessage({ type: 'danger', message: `Failed to upload image! [${res.error.name}: ${res.error.message}]` });
      return;
    }

    // Generate and set signed image url, together with file extension
    const { data, error } = await supabase.storage
      .from('images')
      .createSignedUrl(`${userId}/${tempName}.${fileExt}`, 3600);
    if (error) {
      showMessage({ type: 'danger', message: `Failed to move generate signed url! [${error.name}: ${error.message}]` });
      return;
    } else {
      setFileExt(fileExt);
      setSignedUrl(data.signedUrl);
    }

    setShowOCRPopup(true);
  };

  const closeOCRPopup = () => {
    setShowOCRPopup(false);
  };

  const handleOCRButton1 = async () => {
    handleOCRButton('');
  };

  const handleOCRButton2 = async () => {
    handleOCRButton('2');
  };

  const handleOCRButton = async (mode: string) => {
    if (ocrLoading || !signedUrl) return; // Just in case
    setOcrLoading(true);

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

    const res = await fetch(process.env.EXPO_PUBLIC_BACKEND_BASE_URL + '/ai/ocr' + mode, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        SUPABASE_ACCESS_TOKEN: access_token,
      },
      body: JSON.stringify({
        imageUrl: signedUrl,
      }),
    });

    const json = await res.json();
    console.log('Backend Response', json);
    if (json['success']) {
      // Fields will only be replaced if AI OCR has managed to extract it, otherwise, the user's current values (if any) will be retained
      const jsonData = json['data'];
      if (jsonData['product_name']) {
        setName(jsonData['product_name']);
      }
      if (jsonData['product_description']) {
        setDescription(jsonData['product_description']);
      }
      if (jsonData['product_price']) {
        setPrice(jsonData['product_price']);
      }
      if (jsonData['purchase_date']) {
        setPurchaseDate(new Date(jsonData['purchase_date']));
      }
      if (jsonData['expiration_date']) {
        setExpirationDate(new Date(jsonData['expiration_date']));
      }
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
  };

  const handleSubmitButton = async () => {
    if (submitLoading) return; // Just in case
    setSubmitLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const data = {
      name: name,
      description: description,
      categories: categories.split(','), // TODO: Also handle whitespaces
      purchase_date: formatDate(purchaseDate),
      expiration_date: formatDate(expirationDate),
      organisation_id: user!.user_metadata.default_organisation as number,
      price: parseFloat(price.replace(/,/g, '')), // Note: No need to handle $ symbol since user can't type that in anyways
    };
    console.log('Form Data is', data);
    const { data: warranty, error } = await supabase.from('warranties').insert(data).select().single();
    if (error) {
      showMessage({ type: 'danger', message: `Failed to Insert Warranty! [${error.name}: ${error.message}]` });
      setSubmitLoading(false);
      return;
    }

    // Move warranty image (if any)
    if (signedUrl) {
      const tempPath = `${user!.id}/${tempName}.${fileExt}`;
      // TODO: Support multiple images
      const finalizedPath = `${warranty.organisation_id}/${warranty.id}.${fileExt}`;
      const { error: error2 } = await supabase.storage.from('images').move(tempPath, finalizedPath);
      if (error2) {
        showMessage({ type: 'danger', message: `Failed to Move Warranty Image! [${error2.name}: ${error2.message}]` });
        setSubmitLoading(false);
        return;
      }
    }

    showMessage({ type: 'success', message: 'Successfully Added Warranty!' });
    setSubmitLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styleSheet.scrollView}>
      <FlashMessage position="top" />

      <Text style={styleSheet.textLabel}>Warranty Image:</Text>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {signedUrl && <Image source={{ uri: signedUrl }} style={styleSheet.image} />}

      <Text style={styleSheet.textLabel}>Name:</Text>
      <TextInput
        style={styleSheet.textInput}
        value={name}
        onChangeText={setName}
        placeholder="Laptop"
        placeholderTextColor="#808080"
      />

      <Text style={styleSheet.textLabel}>Description:</Text>
      <TextInput
        style={styleSheet.textInputMultiline}
        value={description}
        onChangeText={setDescription}
        placeholder="11-inch Laptop"
        placeholderTextColor="#808080"
        multiline={true}
      />

      <Text style={styleSheet.textLabel}>Categories (Comma-Separated):</Text>
      <TextInput
        style={styleSheet.textInput}
        value={categories}
        onChangeText={setCategories}
        placeholder="Electronics,Software"
        placeholderTextColor="#808080"
      />

      <Text style={styleSheet.textLabel}>Price:</Text>
      <TextInput
        style={styleSheet.textInput}
        value={price}
        onChangeText={text => setPrice(text.replace(/[^0-9.,]/g, ''))}
        keyboardType="numeric"
        placeholder="0"
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
                <Button title="Yes (PaddleOCR + Gemini)" onPress={handleOCRButton2} />
                <Button title="Yes (Gemini Only)" onPress={handleOCRButton1} />
                <Button title="No" onPress={closeOCRPopup} />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styleSheet = StyleSheet.create({
  scrollView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textLabel: {
    marginBottom: 5,
  },
  textInput: {
    marginBottom: 15,
    borderWidth: 1,
    minWidth: 200,
    minHeight: 20,
  },
  textInputMultiline: {
    marginBottom: 15,
    borderWidth: 1,
    minWidth: 200,
    minHeight: 60,
    textAlignVertical: 'top', // For multiline
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
