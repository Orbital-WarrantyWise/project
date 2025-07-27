import { StyleSheet, View, Text, TextInput, Button, ActivityIndicator, Image, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { DatePickerModal } from 'react-native-paper-dates'; // Tried https://github.com/react-native-datetimepicker/datetimepicker and https://github.com/mmazzarolo/react-native-modal-datetime-picker, but both don't work on Web
import { format } from 'date-fns';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/helpers/supabase';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function EditWarranty() {
  const params = useLocalSearchParams<{ warrantyId: string }>();

  const [orgId, setOrgId] = useState<number>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState<string | null>(null);
  const [categories, setCategories] = useState('');
  const [price, setPrice] = useState('');
  const [openPurchaseDatePicker, setOpenPurchaseDatePicker] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState(new Date());
  const [openExpirationDatePicker, setOpenExpirationDatePicker] = useState(false);
  const [expirationDate, setExpirationDate] = useState(new Date());
  const [submitLoading, setSubmitLoading] = useState(false);
  const [fileExt, setFileExt] = useState<string | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  // TODO: ASDF
  useEffect(() => {
    if (orgId) {
      const loadImage = async () => {
        const { data: images, error } = await supabase.storage
          .from('images')
          .list(orgId.toString(), { search: params.warrantyId });
        if (error) {
          showMessage({ type: 'danger', message: `Failed to load image! [${error.name}: ${error.message}]` });
          return;
        }

        if (images.length !== 0) {
          const image = images[0];
          const { data, error } = await supabase.storage.from('images').createSignedUrl(`${orgId}/${image.name}`, 3600);
          if (error) {
            showMessage({
              type: 'danger',
              message: `Failed to create signed image url! [${error.name}: ${error.message}]`,
            });
            return;
          } else {
            setSignedUrl(data.signedUrl);
          }
        }
      };
      loadImage();
    }
  }, [orgId, params.warrantyId]);

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
        showMessage({ type: 'danger', message: `Failed to load warranty! [${error.name}: ${error.message}]` });
        return;
      }

      setOrgId(data.organisation_id);
      setName(data.name);
      setDescription(data.description);
      setCategories(data.categories ? data.categories.join(',') : '');
      setPrice(parseFloat((data.price as string).substring(1).replace(/,/g, '')).toString());
      setPurchaseDate(new Date(data.purchase_date));
      setExpirationDate(new Date(data.expiration_date));
      setSubmitLoading(false);
    };
    load();
  }, [params.warrantyId]);

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

    // Ensure image size is less than 5 MB
    const image = result.assets[0];
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
      res = await supabase.storage.from('images').upload(`${userId}/temp.${fileExt}`, image.file!);
    } else {
      fileExt = image.uri.split('.').pop();
      if (!fileExt) {
        showMessage({ type: 'danger', message: "Couldn't extract file extension from image!" });
        return;
      }
      res = await supabase.storage.from('images').upload(`${userId}/temp.${fileExt}`, decode(image.base64!), {
        contentType: image.mimeType,
      });
    }
    if (res.error) {
      showMessage({ type: 'danger', message: `Failed to upload image! [${res.error.name}: ${res.error.message}]` });
      return;
    }

    // Generate and set signed image url, together with file extension
    const { data, error } = await supabase.storage.from('images').createSignedUrl(`${userId}/temp.${fileExt}`, 3600);
    if (error) {
      showMessage({ type: 'danger', message: `Failed to move temp image! [${error.name}: ${error.message}]` });
      return;
    } else {
      setFileExt(fileExt);
      setSignedUrl(data.signedUrl);
    }
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
      organisation_id: (await supabase.auth.getUser()).data.user!.user_metadata.default_organisation as number,
      price: parseFloat(price.replace(/,/g, '')), // Note: No need to handle $ symbol since user can't type that in anyways
    };
    const { error } = await supabase.from('warranties').update(data).eq('id', Number.parseInt(params.warrantyId));

    if (error) {
      showMessage({ type: 'danger', message: `Failed to Edit Warranty! [${error.name}: ${error.message}]` });
      setSubmitLoading(false);
      return;
    }

    // Move warranty image (if any)
    if (signedUrl) {
      const tempPath = `${user!.id}/temp.${fileExt}`;
      const finalizedPath = `${user!.id}/${params.warrantyId}.${fileExt}`;
      const { error: error2 } = await supabase.storage.from('images').move(tempPath, finalizedPath);
      if (error2) {
        showMessage({ type: 'danger', message: `Failed to Move Warranty Image! [${error2.name}: ${error2.message}]` });
        setSubmitLoading(false);
        return;
      }
    }

    showMessage({ type: 'success', message: 'Successfully Edited Warranty!' });
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
      {signedUrl && <Image style={{ width: 80, height: 80 }} source={{ uri: signedUrl }} onError={console.log} />}

      <Text style={styleSheet.textLabel}>Product Name:</Text>
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
        value={description || ''}
        onChangeText={setDescription}
        placeholder="11-inch Laptop"
        placeholderTextColor="#808080"
        multiline={true}
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
});
