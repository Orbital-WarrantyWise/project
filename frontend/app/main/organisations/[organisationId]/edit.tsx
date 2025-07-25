import { StyleSheet, View, Text, TextInput, Button, Alert, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/helpers/supabase';
import { useLocalSearchParams } from 'expo-router';

export default function EditOrganizationScreen() {
  const { organisationId } = useLocalSearchParams<{ organisationId: string }>();
  const [name, setName] = useState('');
  const [description, setDescription] = useState<string | null>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrgDetails = async () => {
      const { data, error } = await supabase
        .from('organisations')
        .select()
        .eq('id', Number.parseInt(organisationId))
        .single();
      if (error) {
        // TODO: Gracefully handle error here
        return;
      } else {
        setName(data.name);
        setDescription(data.description);
      }
    };

    fetchOrgDetails();
  }, [organisationId]);

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Organization name is required');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('organisations')
      .update({ name, description })
      .eq('id', Number.parseInt(organisationId));

    setLoading(false);

    if (error) {
      console.error(error);
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Organization updated!');
      // TODO: Navigate to organisation's page instead
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={styleSheet.textLabel}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. My Company"
        style={styleSheet.textInput}
        placeholderTextColor="#808080"
      />

      <Text style={styleSheet.textLabel}>Description (optional)</Text>
      <TextInput
        value={description || ''}
        onChangeText={setDescription}
        placeholder="Short description"
        multiline
        style={styleSheet.textInput}
        placeholderTextColor="#808080"
      />

      <View style={styleSheet.submitButtonViewWrapper}>
        {loading ? <ActivityIndicator size="small" /> : <Button title="Create" onPress={handleUpdate} />}
      </View>
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
  submitButtonViewWrapper: {
    marginTop: 15,
  },
});
