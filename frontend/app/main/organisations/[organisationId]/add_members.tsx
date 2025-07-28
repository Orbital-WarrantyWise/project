import { StyleSheet, View, Text, TextInput, Button, FlatList, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import type { Tables } from 'warrantywise-database/database.types';
import { supabase } from '@/helpers/supabase';
import DropDownPicker from 'react-native-dropdown-picker';
import FlashMessage, { showMessage } from 'react-native-flash-message';

type OrgMember = Tables<'organisations_on_users'> & {
  users: Tables<'users'>;
};

export default function AddMembers() {
  const { organisationId } = useLocalSearchParams<{ organisationId: string }>();
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [role, setRole] = useState('Member');
  const [items, setItems] = useState([
    { label: 'Member', value: 'Member' },
    { label: 'Admin', value: 'Admin' },
  ]);

  useEffect(() => {
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
    fetchOrgMembers();
  }, [organisationId]);

  const inviteUser = async () => {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session === null) {
      showMessage({
        type: 'danger',
        message: 'Missing Access Token! Login First!',
      });
      return;
    }
    const { access_token } = session;

    // TODO: Deal with error accordingly
    const res = await fetch(process.env.EXPO_PUBLIC_BACKEND_BASE_URL + '/invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        SUPABASE_ACCESS_TOKEN: access_token,
      },
      body: JSON.stringify({
        email: email,
        organisationId: organisationId,
        role: role,
      }),
    });
    setLoading(false);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
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

      <TextInput
        style={styleSheet.textInput}
        placeholderTextColor="#808080"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email"
      />

      <DropDownPicker open={open} value={role} items={items} setOpen={setOpen} setValue={setRole} setItems={setItems} />

      <View style={styleSheet.submitButtonViewWrapper}>
        {loading ? <ActivityIndicator size="small" /> : <Button title="Invite User" onPress={inviteUser} />}
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
  },
  submitButtonViewWrapper: {
    marginTop: 15,
  },
});
