// screens/OrganizationsDashboard.tsx
import { View, Text, FlatList, Button } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/helpers/supabase';
import type { Tables } from 'warrantywise-database/database.types';
import { useRouter } from 'expo-router';

export default function OrganizationsDashboard() {
  const [organisations, setOrganisations] = useState<Tables<'organisations'>[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchOrganizations = async () => {
      // Exclude non-custom organisations
      const { data, error } = await supabase.from('organisations').select().eq('is_custom', true);
      if (error) {
        // TODO: Gracefully handle error here
      } else {
        setOrganisations(data);
      }
    };
    fetchOrganizations();
  }, []);

  return (
    <View>
      <Text className="text-xl font-bold">Your Organizations</Text>
      <FlatList
        data={organisations}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item: organisation }) => (
          <Button
            title={organisation.name}
            onPress={() =>
              router.navigate({
                pathname: '/organisations/[organisationId]',
                params: { organisationId: organisation.id },
              })
            }
          />
        )}
      />
      <Button title="Create New Organization" onPress={() => router.navigate('/organisations/new')} />
    </View>
  );
}
