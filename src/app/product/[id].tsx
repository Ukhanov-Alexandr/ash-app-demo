import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, CheckRow, Segmented, Stepper, T, Title } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { findProduct } from '@/data/menu';
import { useTheme } from '@/hooks/use-theme';
import { addLine, rub, unitPrice } from '@/lib/core';
import { useStore } from '@/lib/store';

export default function ProductScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { set } = useStore();
  const product = findProduct(useLocalSearchParams<{ id: string }>().id);
  const [sizeId, setSizeId] = useState(product?.sizes?.[0].id);
  const [sauceId, setSauceId] = useState(product?.sauces?.[0].id);
  const [addonIds, setAddonIds] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  if (!product) return <Redirect href="/" />;

  const line = { productId: product.id, sizeId, sauceId, addonIds, qty };
  const toggle = (id: string) =>
    setAddonIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View accessible={false} style={[styles.hero, { backgroundColor: theme.backgroundElement }]}>
          <T style={styles.heroEmoji}>{product.emoji}</T>
        </View>
        <View style={styles.body}>
          <Title>{product.name}</Title>
          <T dim>{product.description}</T>

          {product.sizes && (
            <Segmented
              value={sizeId}
              onChange={setSizeId}
              options={product.sizes.map((s) => ({ ...s, hint: rub(product.price + s.price) }))}
            />
          )}

          {product.sauces && (
            <View>
              <T accessibilityRole="header" style={styles.subtitle}>Соус внутри</T>
              <Segmented value={sauceId} onChange={setSauceId} options={product.sauces} />
            </View>
          )}

          {product.addons && (
            <View>
              <T accessibilityRole="header" style={styles.subtitle}>Добавить</T>
              {product.addons.map((a) => (
                <CheckRow
                  key={a.id}
                  kind="checkbox"
                  title={a.name}
                  right={`+${rub(a.price)}`}
                  selected={addonIds.includes(a.id)}
                  onPress={() => toggle(a.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Закрыть"
        hitSlop={8}
        onPress={() => router.back()}
        // iOS: лист, insets.top = 0; Android: полноэкранная модалка под статус-баром
        style={[styles.close, { top: insets.top + Spacing.three, backgroundColor: theme.background }]}>
        <T style={styles.closeText}>✕</T>
      </Pressable>

      <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.two, backgroundColor: theme.background, borderTopColor: theme.backgroundElement }]}>
        <Stepper value={qty} onChange={setQty} min={1} />
        <View style={styles.flex}>
          <Button
            title={`В корзину · ${rub(unitPrice(product, line) * qty)}`}
            onPress={() => {
              set((s) => ({ cart: addLine(s.cart, line) }));
              router.back();
            }}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: Spacing.four },
  hero: { height: 240, alignItems: 'center', justifyContent: 'center' },
  heroEmoji: { fontSize: 120, lineHeight: 150 },
  body: { padding: Spacing.three, gap: Spacing.three },
  subtitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.one },
  close: { position: 'absolute', right: Spacing.three, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 18, lineHeight: 22 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingTop: Spacing.two, borderTopWidth: StyleSheet.hairlineWidth },
});
