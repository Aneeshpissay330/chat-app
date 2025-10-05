import React, { useEffect, useLayoutEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import {
  ActivityIndicator,
  Avatar,
  List,
  Text,
  useTheme,
} from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  syncContacts,
  selectMatchedUsers,
  selectContactsStatus,
  normalizeVariants,
} from '../../features/contacts';
import { useUserDoc } from '../../hooks/useUserDoc';

const ContactScreen = () => {
  const dispatch = useAppDispatch();
  const navigation = useNavigation();
  const theme = useTheme();
  const { userDoc } = useUserDoc();
  const status = useAppSelector(selectContactsStatus);
  const matched = useAppSelector(selectMatchedUsers);

  useEffect(() => {
    dispatch(
      syncContacts({ myPhoneNumber: userDoc?.phoneNumber ?? undefined }),
    );
  }, [dispatch, userDoc?.phoneNumber]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        status === 'loading' ? (
          <ActivityIndicator
            size={20}
            color={theme.colors.primary}
            style={{ marginRight: 16 }}
          />
        ) : null,
    });
  }, [navigation, status, theme.colors.primary]);

  // Optional: keep "You" at the top
  const data = useMemo(() => {
    if (!userDoc) return matched;

    const isMe = (u: (typeof matched)[number]) =>
      u.uid === userDoc.uid ||
      (!!u.phoneNumber &&
        !!userDoc.phoneNumber &&
        normalizeVariants(u.phoneNumber).some(v =>
          new Set(normalizeVariants(userDoc.phoneNumber!)).has(v),
        ));

    const me = matched.filter(isMe);
    const others = matched
      .filter(u => !isMe(u))
      .sort((a, b) => {
        const nameA = a.displayName ?? a.username ?? a.phoneNumber ?? '';
        const nameB = b.displayName ?? b.username ?? b.phoneNumber ?? '';
        return nameA.localeCompare(nameB);
      });

    return [...me, ...others];
  }, [matched, userDoc]);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <List.Section>
        <List.Subheader>Matched Users</List.Subheader>
      </List.Section>

      <FlashList
        data={data}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No matches found.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isYou =
            (!!userDoc && item.uid === userDoc.uid) ||
            (!!item.phoneNumber &&
              !!userDoc?.phoneNumber &&
              normalizeVariants(item.phoneNumber).some(v =>
                new Set(normalizeVariants(userDoc.phoneNumber!)).has(v),
              ));

          const title = isYou
            ? 'You'
            : item.displayName ?? item.username ?? 'Unknown';

          return (
            <List.Item
              title={title}
              description={item.phoneNumber ?? undefined}
              left={(props) =>
                item.photoURL ? (
                  <Avatar.Image {...props} size={40} source={{ uri: item.photoURL }} />
                ) : (
                  <Avatar.Text
                    size={40}
                    {...props}
                    label={(title === 'You'
                      ? 'YOU'
                      : item.displayName ?? item.username ?? 'U'
                    )
                      .slice(0, 2)
                      .toUpperCase()}
                  />
                )
              }
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                // TODO: navigate to your own profile or settings if isYou, else other user's profile/chat
              }}
            />
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  emptyContainer: {
    paddingHorizontal: 16,
    paddingVertical: 32,
    alignItems: 'center',
  },
});

export default ContactScreen;
