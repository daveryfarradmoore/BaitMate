import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

export default function PlanProgress({ step, onSpecies, onGear, onBudget }: { step: number; onSpecies?: () => void; onGear?: () => void; onBudget?: () => void }) {
  return <View style={styles.row}>{['Species', 'Your gear', 'Budget', 'Method'].map((label, index) => {
    const number = index + 1;
    const action = number < step ? [onSpecies, onGear, onBudget][index] : undefined;
    return <TouchableOpacity key={label} disabled={!action} onPress={action} accessibilityRole="button" accessibilityLabel={`${label}, step ${number}${number === step ? ', current step' : ''}`} style={styles.step}>
      <View style={[styles.circle, number <= step && styles.active]}>{number < step ? <Ionicons name="checkmark" size={16} color="white" /> : <Text style={[styles.number, number === step && styles.white]}>{number}</Text>}</View>
      <Text style={[styles.label, number === step && styles.current]}>{label}</Text>
      <View style={[styles.line, number <= step && styles.active]} />
    </TouchableOpacity>;
  })}</View>;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  step: { flex: 1, gap: 8, minHeight: 64 },
  circle: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  active: { backgroundColor: colors.brand }, white: { color: 'white' },
  number: { color: colors.inkMuted, fontWeight: '700', fontSize: 12 },
  label: { fontSize: 12, color: colors.inkMuted }, current: { color: colors.brand, fontWeight: '800' },
  line: { height: 3, borderRadius: 3, backgroundColor: colors.border },
});
