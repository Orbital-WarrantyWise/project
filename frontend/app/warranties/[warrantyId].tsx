import { StyleSheet, View, Text, TextInput, Button, ActivityIndicator, Image, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { DatePickerModal } from 'react-native-paper-dates'; // Tried https://github.com/react-native-datetimepicker/datetimepicker and https://github.com/mmazzarolo/react-native-modal-datetime-picker, but both don't work on Web
import { format } from 'date-fns';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/helpers/supabase';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

export default function EditWarranty() {
  const params = useLocalSearchParams<{ warrantyId: string }>();

  const [name, setName] = useState('');
  const [categories, setCategories] = useState('');
  const [price, setPrice] = useState('');
  const [openPurchaseDatePicker, setOpenPurchaseDatePicker] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [openExpirationDatePicker, setOpenExpirationDatePicker] = useState(false);
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [submitLoading, setSubmitLoading] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  useEffect(() => {
    const loadImage = async () => {
      const { data: images, error } = await supabase.storage
        .from('images')
        .list((await supabase.auth.getUser()).data.user?.id, { search: params.warrantyId });
      if (error) {
        // TODO: Handle error
        console.log(error);
      } else {
        if (images.length !== 0) {
          const image = images[0];
          const { data, error } = await supabase.storage
            .from('images')
            .createSignedUrl(`${(await supabase.auth.getUser()).data.user?.id}/${image.name}`, 3600);
          if (error) {
            // TODO: Handle error
            console.log(error);
          } else {
            setSignedUrl(data.signedUrl);
          }
        }
      }
    };
    loadImage();
  }, [params.warrantyId]);

  const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd'); // Ref: https://date-fns.org/docs/format
  };

  useEffect(() => {
    const load = async () => {
      if (submitLoading) return; // Just in case

      setSubmitLoading(true);
      const { data, error } = await supabase
        .from('warranties')
        .select()
        .eq('id', Number.parseInt(params.warrantyId))
        .single();
      setSubmitLoading(false);
      if (error) {
        // TODO: Handle error
        return;
      }

      setName(data.name);
      setCategories(data.categories ? data.categories.join(',') : '');
      setPrice(parseFloat((data.price as string).substring(1)).toString());
      setPurchaseDate(new Date(data.purchase_date));
      setExpirationDate(new Date(data.expiration_date));
      setSubmitLoading(false);
    };
    load();
  }, [params.warrantyId]);

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
    }
  };

  const handleSubmitButton = async () => {
    if (submitLoading) return; // Just in case

    setSubmitLoading(true);
    const data = {
      name: name,
      categories: categories.split(','), // TODO: Also handle whitespaces
      purchase_date: formatDate(purchaseDate),
      expiration_date: formatDate(expirationDate),
      organisation_id: (await supabase.auth.getUser()).data.user!.user_metadata.default_organisation as number,
      price: Number.parseInt(price),
    };
    const { error } = await supabase.from('warranties').update(data).eq('id', Number.parseInt(params.warrantyId));

    if (error) {
      showMessage({ type: 'danger', message: 'Failed to Edit Warranty!' });
    } else {
      if (image) {
        let res;
        if (Platform.OS === 'web') {
          const fileExt = image.file!.name.split('.').pop();
          res = await supabase.storage
            .from('images')
            .upload(`${(await supabase.auth.getUser()).data.user?.id}/${params.warrantyId}.${fileExt}`, image.file!, {
              upsert: true,
            });
        } else {
          const fileExt = image.uri.split('.').pop();
          res = await supabase.storage
            .from('images')
            .upload(
              `${(await supabase.auth.getUser()).data.user?.id}/${params.warrantyId}.${fileExt}`,
              decode(image.base64!),
              {
                contentType: image.mimeType,
                upsert: true,
              },
            );
        }
        // TODO: Handle error if uploading to storage fails
        console.log(res.error);
      }
      showMessage({ type: 'success', message: 'Successfully Edited Warranty!' });
    }
    setSubmitLoading(false);
  };

  if (submitLoading) return <ActivityIndicator size="small" />;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {signedUrl && (
        <Image style={{ width: 80, height: 80 }} source={{ uri: image?.uri || signedUrl }} onError={console.log} />
      )}

      <Text style={styleSheet.textLabel}>Product Name:</Text>
      <TextInput
        style={styleSheet.textInput}
        value={name}
        onChangeText={setName}
        placeholder="Laptop"
        placeholderTextColor="#808080"
      />

      <Text style={styleSheet.textLabel}>Product Categories (Comma-Separated):</Text>
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
        <Button title="Edit Warranty" onPress={handleSubmitButton} />
      </View>

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
});
