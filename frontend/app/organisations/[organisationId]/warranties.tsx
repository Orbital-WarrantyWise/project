import { View, Text, FlatList, Button } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import type { Tables } from 'warrantywise-database/database.types';
import { supabase } from '@/helpers/supabase';

export default function OrganizationWarranties() {
  const { organisationId } = useLocalSearchParams<{ organisationId: string }>();
  const router = useRouter();
  const [warranties, setWarranties] = useState<Tables<'warranties'>[]>([]);

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

  return (
    <View>
      <Text className="text-xl font-bold">Organization Warranties</Text>
      <FlatList
        data={warranties}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <Text>{item.product_name}</Text>}
      />
      <Button
        title="Create Warranty"
        onPress={() => router.navigate({ pathname: '/(warranty)/new', params: { organisationId } })}
      />
    </View>
  );
}
