import { Platform } from "react-native";
import { check, PERMISSIONS, request } from 'react-native-permissions';

//Contact Permission
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

//Storage Permission
export const handleStoragePermission = async (type: 'request' | 'check') => {
    if(Platform.OS === 'android') {
        // For Android 13+ (API 33+), we need different permissions
        const androidVersion = Platform.Version as number;
        
        if (androidVersion >= 33) {
            // Android 13+ uses scoped storage, check for media permissions
            if(type === 'check') {
                const readImages = await check(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
                const readVideo = await check(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
                // Return 'granted' only if both are granted
                return (readImages === 'granted' && readVideo === 'granted') ? 'granted' : readImages;
            }
            else if(type === 'request') {
                const readImages = await request(PERMISSIONS.ANDROID.READ_MEDIA_IMAGES);
                const readVideo = await request(PERMISSIONS.ANDROID.READ_MEDIA_VIDEO);
                // Return 'granted' only if both are granted
                return (readImages === 'granted' && readVideo === 'granted') ? 'granted' : readImages;
            }
        } else {
            // For Android 12 and below
            if(type === 'check') {
                return await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
            }
            else if(type === 'request') {
                return await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
            }
        }
    }
    else if(Platform.OS === 'ios') {
        // iOS uses photo library permissions
        if(type === 'check') {
            return await check(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
        }
        else if(type === 'request') {
            return await request(PERMISSIONS.IOS.PHOTO_LIBRARY_ADD_ONLY);
        }
    }
}