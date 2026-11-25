import Ionicons from '@expo/vector-icons/Ionicons';
import { Image, type ImageContentPosition, type ImageSource } from 'expo-image';
import { router, type Href } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors } from '@/constants/colors';

type Banner = {
  key: string;
  title: string;
  subtitle: string;
  cta: string;
  route: Href;
  image: ImageSource;
  position?: ImageContentPosition;
};

// Banner images come from the matching service pages on bookfxorder.com (resized for mobile).
const BANNERS: Banner[] = [
  {
    key: 'transfer',
    title: 'Send Money to India & Nepal',
    subtitle: 'Fast. Secure. Reliable.',
    cta: 'Send Now',
    route: '/transfer',
    image: require('@/assets/images/banners/indo-nepal.jpg'),
  },
  {
    key: 'dsc',
    title: 'Digital Signature Certificate',
    subtitle: 'Apply for a Class 3 DSC online',
    cta: 'Apply Now',
    route: '/digital-signature',
    image: require('@/assets/images/banners/digital-signature.jpg'),
    position: 'right',
  },
  {
    key: 'loans',
    title: 'Loans for Every Need',
    subtitle: 'Personal, business & study loans',
    cta: 'Explore Loans',
    route: '/loans',
    image: require('@/assets/images/banners/loans.jpg'),
    position: 'top',
  },
  {
    key: 'cards',
    title: 'Premium Credit Cards',
    subtitle: 'Rewards, cashback & more',
    cta: 'View Cards',
    route: '/credit-cards',
    image: require('@/assets/images/banners/credit-cards.jpg'),
    position: 'right',
  },
  {
    key: 'scf',
    title: 'Supply Chain Finance',
    subtitle: 'Working capital against invoices',
    cta: 'Learn More',
    route: '/supply-chain-finance',
    image: require('@/assets/images/banners/supply-chain-finance.jpg'),
  },
];

const AUTO_PLAY_MS = 4000;
const HEIGHT = 190;

export function BannerSlider() {
  const listRef = useRef<FlatList<Banner>>(null);
  const [width, setWidth] = useState(0);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Auto-advance; pauses while the user is swiping.
  useEffect(() => {
    if (!width || paused) return;
    const timer = setTimeout(() => {
      const next = (index + 1) % BANNERS.length;
      listRef.current?.scrollToOffset({ offset: next * width, animated: true });
      setIndex(next);
    }, AUTO_PLAY_MS);
    return () => clearTimeout(timer);
  }, [index, width, paused]);

  const onLayout = (e: LayoutChangeEvent) => setWidth(Math.round(e.nativeEvent.layout.width));

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!width) return;
    setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
    setPaused(false);
  };

  const goTo = (i: number) => {
    listRef.current?.scrollToOffset({ offset: i * width, animated: true });
    setIndex(i);
  };

  const renderItem = useCallback(
    ({ item }: { item: Banner }) => (
      <Pressable style={[styles.slide, { width }]} onPress={() => router.push(item.route)}>
        <Image
          source={item.image}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          contentPosition={item.position ?? 'center'}
          transition={200}
        />
        <View style={styles.overlay} />
        <View style={styles.text}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
          <View style={styles.button}>
            <Text style={styles.buttonText}>{item.cta}</Text>
            <Ionicons name="arrow-forward" size={14} color={Colors.white} />
          </View>
        </View>
      </Pressable>
    ),
    [width],
  );

  return (
    <View>
      <View style={styles.container} onLayout={onLayout}>
        {width > 0 && (
          <FlatList
            ref={listRef}
            data={BANNERS}
            keyExtractor={(b) => b.key}
            renderItem={renderItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onScrollBeginDrag={() => setPaused(true)}
            onMomentumScrollEnd={onScrollEnd}
          />
        )}
      </View>
      <View style={styles.dots}>
        {BANNERS.map((b, i) => (
          <Pressable key={b.key} hitSlop={6} onPress={() => goTo(i)} accessibilityLabel={`Show ${b.title}`}>
            <View style={[styles.dot, i === index && styles.dotActive]} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: Colors.navy,
  },
  slide: {
    height: HEIGHT,
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 31, 92, 0.55)',
  },
  text: {
    padding: 20,
    maxWidth: '75%',
  },
  title: {
    color: Colors.white,
    fontSize: 21,
    fontWeight: '700',
    lineHeight: 27,
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowRadius: 6,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    marginTop: 6,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: Colors.red,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    marginTop: 14,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.red,
  },
});
