import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Searchbar, IconButton, useTheme } from 'react-native-paper';
import GroupMemberList, { Member } from '../../GroupMemberList';

export default function Members() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  
  const members: Member[] = [
    { id: '1', name: 'Alex Chen', role: 'admin', presence: 'online', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg' },
    { id: '2', name: 'Emma Wilson', role: 'moderator', presence: 'online', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg' },
    { id: '3', name: 'Sarah Johnson', role: 'member', presence: '2h ago', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg' },
    { id: '4', name: 'Mike Torres', role: 'member', presence: 'offline', avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg' },
  ];

  // Optional filtering logic based on search
  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Searchbar + Add Member button */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Searchbar
            placeholder="Search members..."
            value={search}
            onChangeText={setSearch}
            style={styles.searchbar}
            inputStyle={{ fontSize: 14 }}
          />
        </View>
        <IconButton
          icon="plus"
          mode="contained"
          containerColor={theme.colors.primary}
          iconColor="white"
          onPress={() => {}}
        />
      </View>

      <ScrollView>
        <GroupMemberList
          members={filteredMembers}
          onPromote={(id) => {}}
          onDemote={(id) => {}}
          onRemove={(id) => {}}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  searchWrap: { flex: 1 },
  searchbar: {
    elevation: 0,
    borderRadius: 8,
  },
});
