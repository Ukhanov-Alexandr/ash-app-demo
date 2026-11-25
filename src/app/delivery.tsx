import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, CheckRow, Field, Segmented, T } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { branches } from '@/data/menu';
import { useTheme } from '@/hooks/use-theme';
import { DELIVERY_FEE, FREE_DELIVERY_FROM, rub } from '@/lib/core';
import { useStore, type Delivery } from '@/lib/store';

export default function DeliveryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { delivery, set } = useStore();
  const update = (patch: Partial<Delivery>) => set((s) => ({ delivery: { ...s.delivery, ...patch } }));
  const isDelivery = delivery.mode === 'delivery';

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.three }]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets>
      <Segmented
        value={delivery.mode}
        onChange={(mode) => update({ mode })}
        options={[
          { id: 'pickup', name: 'Самовывоз' },
          { id: 'delivery', name: 'Доставка' },
        ]}
      />

      <View>
        <T accessibilityRole="header" style={styles.subtitle}>
          {isDelivery ? 'Населённый пункт' : 'Где заберёте'}
        </T>
        {branches.map((b) => (
          <CheckRow
            key={b.id}
            kind="radio"
            title={b.town}
            subtitle={`${b.address} · ${b.hours}`}
            selected={b.id === delivery.branchId}
            onPress={() => update({ branchId: b.id })}
          />
        ))}
      </View>

      {isDelivery && (
        <View style={styles.group}>
          <T accessibilityRole="header" style={styles.subtitle}>Куда</T>
          <Field
            accessibilityLabel="Адрес доставки"
            placeholder="Улица, дом, квартира"
            value={delivery.address}
            onChangeText={(address) => update({ address })}
            autoComplete="street-address"
            returnKeyType="done"
          />
          <T dim style={styles.small}>
            Доставка {rub(DELIVERY_FEE)}, от {rub(FREE_DELIVERY_FROM)} — бесплатно.
          </T>
        </View>
      )}

      <Button
        title="Готово"
        disabled={isDelivery && !delivery.address.trim()}
        onPress={() => router.back()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.four },
  group: { gap: Spacing.two },
  subtitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.one },
  small: { fontSize: 14 },
});
