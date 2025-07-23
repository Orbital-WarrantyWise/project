import { View, Text, TextInput, Button, Alert } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/helpers/supabase';

export default function CreateOrganizationScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Organization name is required');
      return;
    }

    setLoading(true);

    const { error } = await supabase.from('organisations').insert({ name, description });

    setLoading(false);

    if (error) {
      console.error(error);
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Organization created!');
      navigation.goBack(); // or navigate to details screen
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-semibold mb-4">Create Organization</Text>

      <Text className="mb-1 text-gray-700">Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. My Company"
        className="border border-gray-300 rounded-md px-3 py-2 mb-4"
      />

      <Text className="mb-1 text-gray-700">Description (optional)</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Short description"
        multiline
        className="border border-gray-300 rounded-md px-3 py-2 mb-6 h-24"
      />

      <Button title={loading ? 'Creating...' : 'Create'} onPress={handleCreate} disabled={loading} />
    </View>
  );
}
