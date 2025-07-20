import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import type { Tables } from 'warrantywise-database/database.types';
import { supabase } from '@/helpers/supabase';

export default function AddMembers() {
  const { organisationId } = useLocalSearchParams<{ organisationId: string }>();
  const [orgMembers, setOrgMembers] = useState<Tables<'organisation_members'>[]>([]);

  useEffect(() => {
    const fetchOrgMembers = async () => {
      const { data, error } = await supabase
        .from('organisation_members')
        .select('*')
        .eq('organisation_id', Number.parseInt(organisationId));
      if (error) {
        // TODO: Gracefully handle error here
      } else {
        setOrgMembers(data);
      }
    };
    fetchOrgMembers();
  }, [organisationId]);

  const [email, setEmail] = useState('');

  const inviteUser = async () => {
    // TODO: Handle invitation by email
    // For now, assume confirmation and directly add to the table
    const addUser = async () => {
      supabase.from('organisations_on_users').insert({
        // TODO: NOT DONE
        organisation_id: Number.parseInt(organisationId),
      });
    };
    addUser();
  };

  return (
    <View>
      <Text className="mt-4 font-semibold">Members</Text>
      <FlatList data={orgMembers} keyExtractor={m => m.user_id!} renderItem={({ item }) => <Text>{item.email}</Text>} />

      <TextInput value={email} onChangeText={setEmail} placeholder="Enter email" />
      <Button title="Invite User" onPress={inviteUser} />
    </View>
  );
}
