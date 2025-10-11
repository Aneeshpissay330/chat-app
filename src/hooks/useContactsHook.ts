import { handleContactPermission } from "../permission";
import { Alert, Linking } from "react-native";
import Contacts from "react-native-contacts";

export function useContactHook() {
  const requestPermissionAndFetchContacts = async () => {
    const permission = await handleContactPermission("request");
    if (permission === "blocked" || permission === "denied") {
      Alert.alert(
        "Permission Required",
        "We need access to your contacts to continue. Please enable it in your app settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
          },
        ],
        { cancelable: true }
      );
      return []; // Return empty if permission denied/blocked
    }

    if (permission === "granted") {
      try {
        const contacts = await Contacts.getAll();
        return contacts;
      } catch (error) {
        // Error fetching contacts
        return [];
      }
    }

    return [];
  };

  return { requestPermissionAndFetchContacts };
}
