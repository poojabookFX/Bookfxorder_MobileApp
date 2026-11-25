import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

import { authClient } from '@/lib/auth-client';

// The website has no file-upload API, but better-auth stores a photo URL on each user (Google
// fills it in). A small square JPEG fits there as a data URI: 256px at 70% quality is ~10-20 KB.
const SIZE = 256;
const QUALITY = 0.7;

export type PhotoSource = 'camera' | 'library';

// Lets the user take or choose a photo, cropped square. Returns a data URI, or null if cancelled.
export async function pickProfilePhoto(source: PhotoSource): Promise<string | null> {
  if (source === 'camera') {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Camera access is turned off. Allow it in your phone settings to take a photo.');
    }
  }

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets[0]) return null;

  const rendered = await ImageManipulator.manipulate(result.assets[0].uri)
    .resize({ width: SIZE, height: SIZE })
    .renderAsync();
  const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: QUALITY, base64: true });
  if (!saved.base64) throw new Error('Could not process the photo. Please try another one.');
  return `data:image/jpeg;base64,${saved.base64}`;
}

// Saves (or with null, removes) the photo on the user's account.
export async function saveProfilePhoto(image: string | null) {
  const { error } = await authClient.updateUser({ image });
  if (error) throw new Error(error.message || 'Could not save your photo. Please try again.');
}
