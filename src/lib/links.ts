import { Linking, Platform } from 'react-native';

// Contact details from bookfxorder.com/contact.
export const SUPPORT_PHONE = '+918800107428';
export const SUPPORT_EMAIL = 'admin@bookfxorder.com';
export const OFFICE_ADDRESS =
  '4th Floor, Padma Tower-2, F No. 409, Rajendra Place, New Delhi, Delhi – 110008';

const OFFICE_COORDS = '28.645256,77.1779931';

export function openWhatsAppSupport() {
  return Linking.openURL(`https://wa.me/${SUPPORT_PHONE.replace('+', '')}`);
}

// Opens the phone's maps app at the head office.
export function openOfficeInMaps() {
  const label = encodeURIComponent('BookFXOrder Head Office');
  const url = Platform.select({
    ios: `maps:0,0?q=${label}@${OFFICE_COORDS}`,
    android: `geo:0,0?q=${OFFICE_COORDS}(${label})`,
    default: `https://www.google.com/maps/search/?api=1&query=${OFFICE_COORDS}`,
  });
  return Linking.openURL(url);
}
