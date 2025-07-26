import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View, Text, Button, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/helpers/supabase';
import type { Tables } from 'warrantywise-database/database.types';

type OrgMember = Tables<'organisations_on_users'> & {
  users: Tables<'users'>;
};

export default function EditWarranty() {
  const { organisationId } = useLocalSearchParams<{ organisationId: string }>();

  const router = useRouter();

  const [org, setOrg] = useState<Tables<'organisations'>>();
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);
  const [warranties, setWarranties] = useState<Tables<'warranties'>[]>([]);

  useEffect(() => {
    const fetchOrgDetails = async () => {
      const { data, error } = await supabase
        .from('organisations')
        .select()
        .eq('id', Number.parseInt(organisationId))
        .single();
      if (error) {
        // TODO: Gracefully handle error here
      } else {
        setOrg(data);
      }
    };
    const fetchOrgWarranties = async () => {
      const { data, error } = await supabase
        .from('warranties')
        .select('*')
        .eq('organisation_id', Number.parseInt(organisationId));
      if (error) {
        // TODO: Gracefully handle error here
      } else {
        setWarranties(data);
      }
    };
    const fetchOrgMembers = async () => {
      const { data, error } = await supabase
        .from('organisations_on_users')
        .select('*, users(*)')
        .eq('organisation_id', Number.parseInt(organisationId));
      if (error) {
        // TODO: Gracefully handle error here
      } else if (!data) {
        // TODO: Return not found
      } else {
        setOrgMembers(data);
      }
    };

    fetchOrgDetails();
    fetchOrgWarranties();
    fetchOrgMembers();
  }, [organisationId]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={styleSheet.textLabel}>{org?.name}</Text>

      <Text style={styleSheet.textLabel}>Members</Text>
      <FlatList
        data={orgMembers}
        keyExtractor={m => m.user_id}
        renderItem={({ item }) => (
          <Text style={styleSheet.textLabel}>
            {item.users.email} - {item.role}
          </Text>
        )}
      />

      <Text style={styleSheet.textLabel}>Warranties</Text>
      <FlatList
        data={warranties}
        keyExtractor={m => m.id.toString()}
        renderItem={({ item }) => <Text style={styleSheet.textLabel}>{item.name}</Text>}
      />

      <View style={styleSheet.submitButtonViewWrapper}>
        <Button
          title="Edit Organisation"
          onPress={() =>
            router.navigate({
              pathname: '/organisations/[organisationId]/edit',
              params: { organisationId },
            })
          }
        />
      </View>

      <View style={styleSheet.submitButtonViewWrapper}>
        <Button
          title="Add Members"
          onPress={() =>
            router.navigate({
              pathname: '/organisations/[organisationId]/add_members',
              params: { organisationId },
            })
          }
        />
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
