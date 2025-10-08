import {
  NavigationProp,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useCameraDevice,
  Camera as VisionCamera,
  type PhotoFile,
  type VideoFile,
} from 'react-native-vision-camera';
import CameraHeader from '../../../components/CameraHeader';
import CaptureBar from '../../../components/CaptureBar';
import ModeSwitcher from '../../../components/ModeSwitcher';
import { useCameraLifecycle } from '../../../hooks/useCameraLifecycle';
import { useCameraPermissions } from '../../../hooks/useCameraPermissions';
import { useRecordingControls } from '../../../hooks/useRecordingControls';
import { useRecordingTimer } from '../../../hooks/useRecordingTimer';
import { useTorch } from '../../../hooks/useTorch';
import { Mode } from '../../../types/camera';
import ImagePicker from 'react-native-image-crop-picker';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { openDmChat, selectChatIdByOther, sendImageNow, sendVideoNow } from '../../../features/messages';

export type RootTabParamList = {
  Gallery: undefined;
};

type ChatRouteParams = {
  CameraScreen: { id: string; type?: 'group'; name?: string; avatar?: string };
};

const CameraScreen: React.FC = () => {
  const [position, setPosition] = useState<'back' | 'front'>('back');
  const [mode, setMode] = useState<Mode>('photo');
  const navigation = useNavigation<NavigationProp<RootTabParamList>>();
  const device = useCameraDevice(position);
  const isActive = useCameraLifecycle();
  const { hasCam } = useCameraPermissions(mode);
  const { flashOn, torch, toggleFlash } = useTorch(false);
  const route = useRoute<RouteProp<ChatRouteParams, 'CameraScreen'>>();

  const otherUid = route.params?.id; // receiver uid from route
  
  // Redux
  const dispatch = useAppDispatch();
  const chatId = useAppSelector(s => selectChatIdByOther(s, otherUid));

  const cameraRef = useRef<VisionCamera>(null);
  const onPhoto = useCallback(
    async (photo: PhotoFile) => {
      if (!chatId) return;
      console.log('Photo captured:', photo);
      
      // Fire and forget - don't await, send immediately and go back
      dispatch(sendImageNow({
        chatId,
        localPath: `file://${photo.path}`, // Add file:// prefix
        mime: 'image/jpeg', // Use standard JPEG mime type
        width: photo.width,
        height: photo.height,
        size: 0, // You might want to get actual file size
      }));
      
      console.log('Image send dispatched');
      // Go back immediately without waiting
      navigation.goBack();
    },
    [chatId, dispatch, navigation],
  );

  const onVideo = useCallback(
    async (video: VideoFile) => {
      if (!chatId) return;
      console.log('Video captured:', video);
      
      // Fire and forget - don't await, send immediately and go back
      dispatch(sendVideoNow({
        chatId,
        localPath: `file://${video.path}`, // Consistent file:// prefix
        mime: 'video/mp4', // Use standard MP4 mime type
        width: video.width,
        height: video.height,
        size: 0, // You might want to get actual file size
        durationMs:
          typeof video.duration === 'number' ? video.duration : undefined,
      }));
      
      console.log('Video send dispatched');
      // Go back immediately without waiting
      navigation.goBack();
    },
    [chatId, dispatch, navigation],
  );

  // Ensure chat is open when component mounts
  useEffect(() => {
    if (otherUid && !chatId) {
      dispatch(openDmChat({ otherUid }));
    }
  }, [otherUid, chatId, dispatch]);

  const { isRecording, onShoot } = useRecordingControls(
    cameraRef,
    mode,
    flashOn,
    onPhoto,
    onVideo,
  );
  const timerText = useRecordingTimer(mode, isRecording);

  const nav = useNavigation();
  const onClose = useCallback(() => {
    if (nav.canGoBack()) nav.goBack();
  }, [nav]);

  const onPressGallery = useCallback(async () => {
    try {
      // Allow both photo & video; cropping only makes sense for images
      const media: any = await ImagePicker.openPicker({
        mediaType: 'any',
        cropping: false,
        // includeExif: true,
      });
      if (!chatId) return;

      // image
      if (media?.mime?.startsWith('image/')) {
        await dispatch(sendImageNow({
          chatId,
          localPath: media.path,
          mime: media.mime,
          width: media.width,
          height: media.height,
          size: media.size,
        }));
        navigation.goBack();
        return;
      }

      // video
      if (media?.mime?.startsWith('video/')) {
        await dispatch(sendVideoNow({
          chatId,
          localPath: media.path,
          mime: media.mime,
          width: media.width,
          height: media.height,
          size: media.size,
          durationMs:
            typeof media.duration === 'number' ? media.duration : undefined,
        }));
        navigation.goBack();
        return;
      }
      navigation.goBack();
    } catch (error) {
      console.log('Gallery error or cancelled', error);
    }
  }, [chatId, dispatch, navigation]);

  const onPressSwitchCamera = useCallback(() => {
    if (isRecording) return;
    setPosition(p => (p === 'back' ? 'front' : 'back'));
  }, [isRecording]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: 'black' },
        camera: { ...StyleSheet.absoluteFillObject },
        topBar: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 8,
        },
        bottomBar: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          paddingHorizontal: 16,
        },
      }),
    [],
  );

  if (device == null || !hasCam) return null;

  return (
    <View style={styles.container}>
      <VisionCamera
        ref={cameraRef}
        style={styles.camera}
        device={device}
        isActive={isActive}
        enableZoomGesture
        torch={device?.hasTorch ? torch : undefined}
        photo
        video
        audio
      />

      {/* TOP: Close + Flash */}
      <SafeAreaView edges={['top']} style={styles.topBar}>
        <CameraHeader
          onClose={onClose}
          flashOn={flashOn}
          onToggleFlash={toggleFlash}
          timerText={timerText}
        />
      </SafeAreaView>

      {/* BOTTOM: Mode switch + Shutter */}
      <SafeAreaView edges={['bottom']} style={styles.bottomBar}>
        <ModeSwitcher mode={mode} onChangeMode={setMode} />
        <CaptureBar
          mode={mode}
          isRecording={isRecording}
          onPressShutter={onShoot}
          onPressGallery={onPressGallery}
          onPressSwitchCamera={onPressSwitchCamera}
        />
      </SafeAreaView>
    </View>
  );
};

export default React.memo(CameraScreen);
