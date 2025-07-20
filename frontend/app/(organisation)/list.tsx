// screens/OrganizationsDashboard.tsx
import { View, Text, FlatList, Button } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/helpers/supabase';
import type { Tables } from 'warrantywise-database/database.types';
import { useRouter } from 'expo-router';

interface Result extends Tables<'organisations_on_users'> {
  organisations: Tables<'organisations'>;
}

export default function OrganizationsDashboard() {
  const [organisations, setOrganisations] = useState<Result[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchOrganizations = async () => {
      const { data, error } = await supabase.from('organisations_on_users').select(`*, organisations(*)`);
      console.log('ASDF', data, error);
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
        renderItem={({ item }) => (
          <Button
            title={item.organisations.name}
            onPress={() =>
              router.navigate({
                pathname: '/(organisation)/organisations/[organisationId]',
                params: { organisationId: item.organisation_id },
              })
            }
          />
        )}
      />
      <Button title="Create New Organization" onPress={() => router.navigate('/(organisation)/new')} />
    </View>
  );
}
