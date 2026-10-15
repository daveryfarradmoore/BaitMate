import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, AppState, Easing, ImageSourcePropType, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

export const FISH_ART: Record<string, ImageSourcePropType> = {
  'largemouth-bass': require('../../assets/species/largemouth-bass-realistic.png'),
  'smallmouth-bass': require('../../assets/species/smallmouth-bass-realistic.png'),
  trout: require('../../assets/species/trout-realistic.png'),
  'atlantic-salmon': require('../../assets/species/atlantic-salmon-realistic.png'),
  bluegill: require('../../assets/species/bluegill-realistic.png'),
  catfish: require('../../assets/species/catfish-realistic.png'),
};

/** A continuous traveling wave bends the artwork, strongest toward the tail.
 * All strips sample the same full image, preserving the fish's proportions.
 */
export default function SwimmingFish({ speciesId, paused = false, large = false }: {
  speciesId: string; paused?: boolean; large?: boolean;
}) {
  const [width, setWidth] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(true);
  const [active, setActive] = useState(AppState.currentState === 'active');
  const focused = useIsFocused();
  const phase = useRef(new Animated.Value(0)).current;
  const height = width * 0.58;

  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReduceMotion(value); });
    const motion = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    const state = AppState.addEventListener('change', value => setActive(value === 'active'));
    return () => { mounted = false; motion.remove(); state.remove(); };
  }, []);

  useEffect(() => {
    if (paused || reduceMotion || !active || !focused) return;
    phase.setValue(0);
    const loop = Animated.loop(Animated.timing(phase, {
      toValue: 1, duration: 1900, easing: Easing.linear, useNativeDriver: true, isInteraction: false,
    }));
    loop.start();
    return () => loop.stop();
  }, [paused, reduceMotion, active, focused, phase]);

  const source = FISH_ART[speciesId];
  if (!source) return null;
  const moving = !reduceMotion;
  const slices = 32;
  const inputRange = Array.from({ length: 25 }, (_, i) => i / 24);

  return <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" onLayout={event => setWidth(event.nativeEvent.layout.width)} style={[styles.stage, large && styles.large]}>
    <View style={styles.light} />
    {width > 0 && <View style={{ width, height }}>
      {Array.from({ length: slices }, (_, index) => {
        const x = index / (slices - 1);
        const amplitude = height * (0.002 + 0.032 * Math.pow(x, 3));
        const outputRange = inputRange.map(t => Math.sin(t * Math.PI * 2 - x * 3.5) * amplitude);
        return <Animated.View key={index} style={{ position: 'absolute', left: width * index / slices, width: width / slices + 0.5, height, overflow: 'hidden', transform: [{ translateY: moving ? phase.interpolate({ inputRange, outputRange }) : 0 }] }}>
          <Animated.Image source={source} resizeMode="contain" style={{ position: 'absolute', left: -width * index / slices, width, height }} />
        </Animated.View>;
      })}
    </View>}
  </View>;
}
const styles = StyleSheet.create({
  stage: { width: '100%', aspectRatio: 1.72, justifyContent: 'center', overflow: 'hidden', borderRadius: 18, backgroundColor: '#E8F3F0', marginBottom: 14 },
  large: { maxWidth: 520, alignSelf: 'center' },
  light: { position: 'absolute', width: '85%', height: '70%', top: '-25%', left: '8%', borderRadius: 999, backgroundColor: '#F5FCF8' },
});
