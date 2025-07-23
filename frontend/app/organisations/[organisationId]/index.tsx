import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, Button, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/helpers/supabase';
import type { Tables } from 'warrantywise-database/database.types';

export default function EditWarranty() {
  const { organisationId } = useLocalSearchParams<{ organisationId: string }>();

  const router = useRouter();

  const [org, setOrg] = useState<Tables<'organisations'>>();
  const [orgMembers, setOrgMembers] = useState<Tables<'organisation_members'>[]>([]);
  const [warranties, setWarranties] = useState<Tables<'warranties'>[]>([]);

  useEffect(() => {
    const fetchOrgDetails = async () => {
      const { data, error } = await supabase
        .from('organisations')
        .select()
        .eq('organisation_id', organisationId)
        .single();
      if (error) {
        // TODO: Gracefully handle error here
      } else {
        setOrg(data);
      }
    };
    fetchOrgDetails();
  }, [organisationId]);

  useEffect(() => {
    const fetchOrgWarranties = async () => {
      const { data, error } = await supabase
        .from('warranty_on_organisations')
        .select('warranties(*)')
        .eq('organisation_id', Number.parseInt(organisationId));
      if (error) {
        // TODO: Gracefully handle error here
      } else {
        setWarranties(data.map(({ warranties }) => warranties));
      }
    };
    fetchOrgWarranties();
  }, [organisationId]);

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

  return (
    <View>
      <Text className="text-2xl font-bold">{org?.name}</Text>

      <Text className="mt-4 font-semibold">Members</Text>
      <FlatList data={orgMembers} keyExtractor={m => m.user_id!} renderItem={({ item }) => <Text>{item.email}</Text>} />

      <Button
        title="Add Members"
        onPress={() =>
          router.navigate({
            pathname: '/(organisation)/organisations/[organisationId]/edit',
            params: { organisationId },
          })
        }
      />
      <Button
        title="View Warranties"
        onPress={() =>
          router.navigate({
            pathname: '/(organisation)/organisations/[organisationId]/warranties',
            params: { organisationId },
          })
        }
      />
    </View>
  );
}
