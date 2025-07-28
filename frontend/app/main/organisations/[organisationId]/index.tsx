import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View, Text, Button, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '@/helpers/supabase';
import type { Tables } from 'warrantywise-database/database.types';
import { dateTimeFormatter } from '@/helpers/utils';

type OrgMember = Tables<'organisations_on_users'> & {
  users: Tables<'users'>;
};

const TABLE_HEADERS = ['Name', 'Description', 'Categories', 'Price', 'Purchase Date', 'Expiry Date'];

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
        ListHeaderComponent={() => (
          <View style={styleSheet.table_row}>
            {TABLE_HEADERS.map(header => (
              <Text key={header} style={[styleSheet.table_cell, styleSheet.bold_cell]}>
                {header}
              </Text>
            ))}
            <Text style={[styleSheet.table_cell, styleSheet.bold_cell]}>Edit</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styleSheet.table_row}>
            <Text style={styleSheet.table_cell}>{item.name}</Text>
            <Text style={styleSheet.table_cell}>{item.description}</Text>
            <Text style={styleSheet.table_cell}>{item.categories ? item.categories?.join(',') : ''}</Text>
            <Text style={styleSheet.table_cell}>{item.price as string}</Text>
            <Text style={styleSheet.table_cell}>{dateTimeFormatter.format(new Date(item.purchase_date))}</Text>
            <Text style={styleSheet.table_cell}>{dateTimeFormatter.format(new Date(item.expiration_date))}</Text>
            <View style={styleSheet.table_cell}>
              <Button
                title="Edit"
                onPress={() => {
                  router.navigate({
                    pathname: '/warranties/[warrantyId]',
                    params: { warrantyId: item.id },
                  });
                }}
              />
            </View>
          </View>
        )}
        keyExtractor={item => item.id.toString()}
      />

      <View style={styleSheet.submitButtonViewWrapper}>
        <Button
          title="Edit Organisation"
          onPress={() =>
            router.navigate({
              pathname: '/main/organisations/[organisationId]/edit',
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
              pathname: '/main/organisations/[organisationId]/add_members',
              params: { organisationId },
            })
          }
        />
      </View>

      <View style={styleSheet.submitButtonViewWrapper}>
        <Button
          title="Add Warranty"
          onPress={() =>
            router.navigate({
              pathname: '/organisations/[organisationId]/warranties/new',
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
  table_row: {
    flex: 1, // Needed to draw table column lines correctly
    flexDirection: 'row', // Overflow <Text> blocks horizontally instead of vertically
    borderBottomWidth: 1, // Only draw bottom border to prevent overlap
  },
  table_cell: {
    flex: 1, // Needed to draw table column lines correctly
    borderRightWidth: 1, // Only draw right border to prevent overlap
    padding: 5,
    textAlign: 'center',
  },
  bold_cell: {
    fontWeight: 'bold',
  },
});
