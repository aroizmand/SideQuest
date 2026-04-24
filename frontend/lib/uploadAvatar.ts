import { Platform, Alert, ActionSheetIOS } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from './supabase';

function chooseSource(): Promise<'camera' | 'library' | null> {
  return new Promise((resolve) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Take Photo', 'Choose from Library'], cancelButtonIndex: 0 },
        (i) => { if (i === 1) resolve('camera'); else if (i === 2) resolve('library'); else resolve(null); }
      );
    } else {
      Alert.alert('Profile Photo', 'Choose a source', [
        { text: 'Take Photo', onPress: () => resolve('camera') },
        { text: 'Choose from Library', onPress: () => resolve('library') },
        { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
      ]);
    }
  });
}

export async function pickAndUploadAvatar(userId: string): Promise<string | null> {
  const source = await chooseSource();
  if (!source) return null;

  let result: ImagePicker.ImagePickerResult;

  if (source === 'camera') {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera access is needed to take a photo.');
      return null;
    }
    result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
  } else {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Photo library access is needed to choose a photo.');
      return null;
    }
    result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
  }

  if (result.canceled) return null;

  const asset = result.assets[0];
  const uri = asset.uri;

  // Derive a reasonable content type from the asset mime/URI
  const inferredType =
    asset.mimeType ??
    (uri.toLowerCase().endsWith('.png') ? 'image/png'
      : uri.toLowerCase().endsWith('.webp') ? 'image/webp'
      : 'image/jpeg');

  const ALLOWED: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg':  'jpg',
    'image/png':  'png',
    'image/webp': 'webp',
  };
  const ext = ALLOWED[inferredType];
  if (!ext) {
    Alert.alert('Unsupported image', 'Please pick a JPEG, PNG, or WebP image.');
    return null;
  }

  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();

  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
  if (arrayBuffer.byteLength > MAX_BYTES) {
    Alert.alert('Image too large', 'Please pick an image under 5 MB.');
    return null;
  }

  const path = `${userId}/avatar.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(path, arrayBuffer, { contentType: inferredType, upsert: true });

  if (uploadError) {
    Alert.alert('Upload failed', uploadError.message);
    return null;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  // Append timestamp so the image refreshes immediately after each update
  const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

  const { error: updateError } = await supabase
    .from('dim_user')
    .update({ photo_url: publicUrl })
    .eq('user_id', userId);

  if (updateError) {
    Alert.alert('Update failed', updateError.message);
    return null;
  }

  return publicUrl;
}
