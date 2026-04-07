import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

const AuroraBackground = () => {
  const drift = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const driftLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: 12500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: 12500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.55,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.85,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    driftLoop.start();
    pulseLoop.start();

    return () => {
      driftLoop.stop();
      pulseLoop.stop();
    };
  }, [drift, pulse]);

  const driftX1 = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 20],
  });
  const driftY1 = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 15],
  });
  const driftX2 = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -20],
  });
  const driftY2 = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [10, -15],
  });

  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.baseGradient} />
      <View style={styles.topMintLayer} />
      <View style={styles.bottomCyanLayer} />

      <Animated.View
        style={[
          styles.fishWrap,
          styles.fishOne,
          { transform: [{ translateX: driftX1 }, { translateY: driftY1 }] },
        ]}
      >
        <AnimatedIonicons name="fish" size={110} color="rgba(6, 95, 70, 0.52)" />
      </Animated.View>
      <Animated.View
        style={[
          styles.fishWrap,
          styles.fishTwo,
          { transform: [{ translateX: driftX2 }, { translateY: driftY2 }] },
        ]}
      >
        <AnimatedIonicons name="fish" size={120} color="rgba(4, 120, 87, 0.5)" />
      </Animated.View>
      <Animated.View
        style={[
          styles.fishWrap,
          styles.fishThree,
          { transform: [{ translateX: driftX1 }, { translateY: driftY2 }] },
        ]}
      >
        <AnimatedIonicons name="fish" size={95} color="rgba(20, 83, 45, 0.55)" />
      </Animated.View>

      <Animated.View style={[styles.vignette, { opacity: pulse }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  baseGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f5f5f5',
  },
  topMintLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 255, 136, 0.22)',
  },
  bottomCyanLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(97, 239, 255, 0.2)',
    transform: [{ translateY: 120 }],
  },
  fishWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fishOne: {
    left: -20,
    top: 20,
    transform: [{ rotate: '-8deg' }],
  },
  fishTwo: {
    right: -25,
    top: 120,
    transform: [{ rotate: '12deg' }],
  },
  fishThree: {
    left: 70,
    bottom: 10,
    transform: [{ rotate: '-15deg' }],
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
});

export default AuroraBackground;
