import * as React from 'react';
import { View } from 'react-native';
import { Avatar, List, Text, useTheme, Menu, IconButton } from 'react-native-paper';

export type Member = {
  id: string;
  name: string;
  role?: 'admin' | 'moderator' | 'member';
  avatar?: string;
  presence?: 'online' | 'offline' | string;
};

type Props = {
  members: Member[];
  onPromote?: (id: string) => void;
  onDemote?: (id: string) => void;
  onRemove?: (id: string) => void;
};

export default function GroupMemberList({ members, onPromote, onDemote, onRemove }: Props) {
  const theme = useTheme();
  const [openFor, setOpenFor] = React.useState<string | null>(null);

  const RoleBadge = ({ role }: { role?: Member['role'] }) => {
    if (!role || role === 'member') return null;
    const label = role === 'admin' ? 'Admin' : 'Moderator';
    const bg = role === 'admin' ? theme.colors.primary : theme.colors.secondary;
    return (
      <Text style={{ backgroundColor: bg, color: 'white', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, fontSize: 12 }}>
        {label}
      </Text>
    );
  };

  return (
    <View style={{ marginHorizontal: 16 }}>
      {members.map(m => (
        <List.Item
          key={m.id}
          title={m.name}
          description={`${m.role ? m.role[0].toUpperCase() + m.role.slice(1) : 'Member'} • ${m.presence ?? ''}`.trim()}
          left={() =>
            m.avatar ? <Avatar.Image size={48} source={{ uri: m.avatar }} /> : <Avatar.Text size={48} label={m.name.split(' ').map(n => n[0]).join('').slice(0, 2)} />
          }
          right={() => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <RoleBadge role={m.role} />
              <Menu
                visible={openFor === m.id}
                onDismiss={() => setOpenFor(null)}
                anchor={<IconButton icon="dots-vertical" onPress={() => setOpenFor(m.id)} />}>
                {onPromote && <Menu.Item onPress={() => { setOpenFor(null); onPromote(m.id); }} title="Make Admin" />}
                {onDemote && <Menu.Item onPress={() => { setOpenFor(null); onDemote(m.id); }} title="Remove Admin" />}
                {onRemove && <Menu.Item onPress={() => { setOpenFor(null); onRemove(m.id); }} title="Remove from Group" />}
              </Menu>
            </View>
          )}
        />
      ))}
    </View>
  );
}
