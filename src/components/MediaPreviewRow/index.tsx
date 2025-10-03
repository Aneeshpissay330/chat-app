import {
  ScrollView,
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { List } from 'react-native-paper';

export type RootTabParamList = {
  MediaTabsScreen: undefined;
};

const MediaPreviewRow = () => {
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();

  const media = [
    {
      id: '1',
      uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-1.jpg',
    },
    {
      id: '2',
      uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-2.jpg',
    },
    {
      id: '3',
      uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-3.jpg',
    },
    {
      id: '4',
      uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-4.jpg',
    },
    {
      id: '5',
      uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
    },
    {
      id: '6',
      uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-6.jpg',
    },
    {
      id: '7',
      uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-7.jpg',
    },
    {
      id: '8',
      uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-8.jpg',
    },
    {
      id: '9',
      uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-9.jpg',
    },
    {
      id: '10',
      uri: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-10.jpg',
    },
  ];

  return (
    <View>
      <List.Item
        title="Media, links and docs"
        titleStyle={{ fontWeight: 'bold', fontSize: 14 }}
        right={(p) => <List.Icon {...p} icon="arrow-right" />}
        onPress={() => navigation.navigate('MediaTabsScreen')}
      />
      {/* <List.Subheader style={styles.subheader}>
        Media, links and docs
      </List.Subheader> */}
      <View style={styles.rowContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {media.map(item => (
            <Image
              key={item.id}
              source={{ uri: item.uri }}
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
  seeAll: {
    fontSize: 24,
    paddingLeft: 8,
    color: '#007AFF',
  },
  subheader: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
});

export default MediaPreviewRow;
