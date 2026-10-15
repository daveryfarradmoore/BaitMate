import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

const AuroraBackground = () => {
  const drift = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0.45)).current;

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
          toValue: 0.25,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.5,
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
    outputRange: [-14, 14],
  });
  const driftY1 = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 10],
  });
  const driftX2 = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [12, -12],
  });
  const driftY2 = drift.interpolate({
    inputRange: [0, 1],
    outputRange: [8, -10],
  });

  return (
    <View pointerEvents="none" style={styles.container}>
      <View style={styles.base} />

      <Animated.View
        style={[
          styles.orb,
          styles.orbOne,
          { transform: [{ translateX: driftX1 }, { translateY: driftY1 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.orb,
          styles.orbTwo,
          { transform: [{ translateX: driftX2 }, { translateY: driftY2 }] },
        ]}
      />

      <Animated.View style={[styles.glow, { opacity: pulse }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },
  base: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.canvas,
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
  },
  orbOne: {
    width: 360,
    height: 360,
    right: -160,
    top: -170,
    backgroundColor: 'rgba(75, 180, 162, 0.14)',
  },
  orbTwo: {
    width: 280,
    height: 280,
    left: -150,
    bottom: -120,
    backgroundColor: 'rgba(242, 166, 90, 0.10)',
  },
  glow: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
});

export default AuroraBackground;
