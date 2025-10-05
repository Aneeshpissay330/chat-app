import { Platform } from "react-native";
import { check, PERMISSIONS, request } from 'react-native-permissions';

//Camera Permission
export const handleContactPermission = async (type: 'request' | 'check') => {
    if(Platform.OS === 'android') {
        if(type === 'check') {
            return await check(PERMISSIONS.ANDROID.READ_CONTACTS);
        }
        else if(type === 'request') {
            return await request(PERMISSIONS.ANDROID.READ_CONTACTS);
        }
    }
    else if(Platform.OS === 'ios') {
        if(type === 'check') {
            return await check(PERMISSIONS.IOS.CONTACTS);
        }
        else if(type === 'request') {
            return await request(PERMISSIONS.IOS.CONTACTS);
        }
    }
}