import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type TextProps, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Текст в цветах темы. `dim` — второстепенный. */
export function T({ dim, style, ...props }: TextProps & { dim?: boolean }) {
  const theme = useTheme();
  return <Text {...props} style={[{ color: dim ? theme.textSecondary : theme.text, fontSize: 16 }, style]} />;
}

export function Title(props: TextProps) {
  return <T accessibilityRole="header" {...props} style={[styles.title, props.style]} />;
}

export function Card({ style, ...props }: ViewProps) {
  const theme = useTheme();
  return <View {...props} style={[styles.card, { backgroundColor: theme.backgroundElement }, style]} />;
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
};

export function Button({ title, onPress, disabled, variant = 'primary' }: ButtonProps) {
  const theme = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: primary ? theme.accent : theme.backgroundElement, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
      ]}>
      <Text style={[styles.buttonText, { color: primary ? theme.onAccent : theme.text }]}>{title}</Text>
    </Pressable>
  );
}

export function Stepper({ value, onChange, min = 0 }: { value: number; onChange: (v: number) => void; min?: number }) {
  const theme = useTheme();
  const side = (label: string, a11y: string, next: number) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={a11y}
      disabled={next < min}
      hitSlop={6}
      onPress={() => onChange(next)}
      style={styles.stepperSide}>
      <T style={[styles.stepperSign, next < min && { color: theme.backgroundSelected }]}>{label}</T>
    </Pressable>
  );
  return (
    <View style={[styles.stepper, { backgroundColor: theme.backgroundElement }]}>
      {side('−', 'Меньше', value - 1)}
      <T style={styles.stepperValue}>{value}</T>
      {side('+', 'Больше', value + 1)}
    </View>
  );
}

type SegmentedProps<V extends string> = {
  options: { id: V; name: string; hint?: string }[];
  value: V | undefined;
  onChange: (v: V) => void;
};

export function Segmented<V extends string>({ options, value, onChange }: SegmentedProps<V>) {
  const theme = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: theme.backgroundElement }]}>
      {options.map((o) => {
        const selected = o.id === value;
        return (
          <Pressable
            key={o.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(o.id)}
            style={[styles.segment, selected && { backgroundColor: theme.background }]}>
            <T style={styles.segmentText} dim={!selected}>
              {o.name}
            </T>
            {o.hint && <T dim style={styles.small}>{o.hint}</T>}
          </Pressable>
        );
      })}
    </View>
  );
}

type CheckRowProps = {
  title: string;
  subtitle?: string;
  right?: string;
  selected: boolean;
  onPress: () => void;
  kind: 'radio' | 'checkbox';
};

/** Строка с выбором: радио (один из) или чекбокс (несколько). */
export function CheckRow({ title, subtitle, right, selected, onPress, kind }: CheckRowProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole={kind}
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={styles.checkRow}>
      <View
        style={[
          styles.mark,
          { borderColor: selected ? theme.accent : theme.textSecondary, borderRadius: kind === 'radio' ? 12 : 7 },
          selected && { backgroundColor: theme.accent },
        ]}>
        {selected && <Text style={[styles.markTick, { color: theme.onAccent }]}>✓</Text>}
      </View>
      <View style={styles.flex}>
        <T>{title}</T>
        {subtitle && <T dim style={styles.small}>{subtitle}</T>}
      </View>
      {right && <T dim>{right}</T>}
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  const theme = useTheme();
  return (
    <TextInput
      placeholderTextColor={theme.textSecondary}
      {...props}
      style={[styles.field, { backgroundColor: theme.backgroundElement, color: theme.text }, props.style]}
    />
  );
}

/** Заглушка фото товара, пока нет качественных снимков. */
export function ProductImage({ emoji, size }: { emoji: string; size: number }) {
  const theme = useTheme();
  return (
    <View accessible={false} style={[styles.image, { width: size, height: size, backgroundColor: theme.backgroundElement }]}>
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}

export function Empty({ title, text, children }: { title: string; text: string; children?: ReactNode }) {
  return (
    <View style={styles.empty}>
      <Title style={styles.center}>{title}</Title>
      <T dim style={styles.center}>{text}</T>
      {children && <View style={styles.emptyAction}>{children}</View>}
    </View>
  );
}

export function TotalRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.totalRow}>
      <T dim={!bold} style={bold && styles.bold}>{label}</T>
      <T style={bold && styles.bold}>{value}</T>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { textAlign: 'center' },
  small: { fontSize: 14 },
  bold: { fontSize: 18, fontWeight: '700' },
  title: { fontSize: 28, fontWeight: '700' },
  card: { borderRadius: Radius, padding: Spacing.three, gap: Spacing.two },
  button: { minHeight: 52, borderRadius: Radius, paddingHorizontal: Spacing.four, alignItems: 'center', justifyContent: 'center' },
  buttonText: { fontSize: 17, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, height: 44 },
  stepperSide: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' },
  stepperSign: { fontSize: 22, lineHeight: 26 },
  stepperValue: { minWidth: 22, textAlign: 'center', fontWeight: '600', fontVariant: ['tabular-nums'] },
  segmented: { flexDirection: 'row', borderRadius: 14, padding: 3 },
  segment: { flex: 1, minHeight: 44, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 },
  segmentText: { fontWeight: '600', fontSize: 15 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, minHeight: 48, paddingVertical: Spacing.two },
  mark: { width: 24, height: 24, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  markTick: { fontSize: 14, fontWeight: '700', lineHeight: 18 },
  field: { minHeight: 52, borderRadius: Radius, paddingHorizontal: Spacing.three, paddingVertical: 14, fontSize: 16 },
  image: { borderRadius: Radius, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.five, gap: Spacing.two },
  emptyAction: { marginTop: Spacing.three, alignSelf: 'stretch' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
});
