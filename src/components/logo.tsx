import { Image } from 'expo-image';

// Source image is 1200x222
const ASPECT_RATIO = 1200 / 222;

type Props = {
  width?: number;
};

export function Logo({ width = 260 }: Props) {
  return (
    <Image
      source={require('@/assets/images/logo.png')}
      style={{ width, height: width / ASPECT_RATIO }}
      contentFit="contain"
      accessibilityLabel="BookFXOrder"
    />
  );
}
