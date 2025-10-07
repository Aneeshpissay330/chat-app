// index.tsx
import React, { useEffect, useMemo } from 'react';
import {
  ScrollView,
  View,
  Image,
  StyleSheet,
} from 'react-native';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { List } from 'react-native-paper';

// from messages slice
import {
  openDmChat,
  startSubscriptions,
  clearChatState,
  selectChatIdByOther,
  selectMessagesByOther,
} from '../../features/messages'; // <- adjust path to your slice
import { useAppDispatch, useAppSelector } from '../../app/hooks';
// ^ selectors & thunks come from your messages slice :contentReference[oaicite:3]{index=3}

export type RootTabParamList = {
  MediaTabsScreen: { id: string };
};

type MediaPreviewRowProps = {
  otherUid: string;
}

const MediaPreviewRow : React.FC<MediaPreviewRowProps> = ({ otherUid }) => {
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();

  const dispatch = useAppDispatch();
  const chatId = useAppSelector((s) =>
    otherUid ? selectChatIdByOther(s, otherUid) : undefined
  );
  const msgs = useAppSelector((s) =>
    otherUid ? selectMessagesByOther(s, otherUid) : []
  );

  // Ensure chat exists
  useEffect(() => {
    if (otherUid && !chatId) {
      dispatch(openDmChat({ otherUid }) as any);
    }
  }, [dispatch, otherUid, chatId]);

  // Start live subscriptions once chatId is known
  useEffect(() => {
    if (otherUid && chatId) {
      // isSelf: false when it’s a DM; tweak if you have a self-chat route
      dispatch(startSubscriptions({ otherUid, chatId, isSelf: false }) as any);
      return () => {
        dispatch(clearChatState({ otherUid }));
      };
    }
  }, [dispatch, otherUid, chatId]);

  // Only images for the row
  const images = useMemo(
    () => msgs.filter(m => m.type === 'image' && !!m.url), // m.url is local first, then patched to cloud URL :contentReference[oaicite:4]{index=4}
    [msgs]
  );

  if (!otherUid) return null;

  return (
    <View>
      <List.Item
        title="Media, links and docs"
        titleStyle={{ fontWeight: 'bold', fontSize: 14 }}
        right={p => <List.Icon {...p} icon="arrow-right" />}
        onPress={() => navigation.navigate('MediaTabsScreen', { id: otherUid })}
      />
      <View style={styles.rowContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {images.map(item => (
            <Image
              key={item.id}
              source={{ uri: item.url! }}
              style={styles.image}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    marginLeft: 16,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
});

export default MediaPreviewRow;
