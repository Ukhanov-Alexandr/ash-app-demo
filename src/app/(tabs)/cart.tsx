import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Empty, ProductImage, Stepper, T, Title } from '@/components/ui';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { rub, setQty } from '@/lib/core';
import { cartView, useStore } from '@/lib/store';

export default function CartScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { cart, profile, set } = useStore();
  const { lines, subtotal } = cartView(cart);
  const bottom = insets.bottom + BottomTabInset + Spacing.three;

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.background }]}>
      {lines.length === 0 ? (
        <View style={[styles.flex, { paddingBottom: bottom }]}>
          <Empty title="Корзина пуста" text="Добавьте что-нибудь из меню — оформим за минуту.">
            <Button title="Перейти в меню" onPress={() => router.navigate('/')} />
          </Empty>
        </View>
      ) : (
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: bottom }]}>
          <Title>Корзина</Title>
          {lines.map(({ key, line, product, unit, options }) => (
            <View key={key} style={styles.row}>
              <ProductImage emoji={product.emoji} size={64} />
              <View style={styles.rowBody}>
                <T style={styles.name}>{product.name}</T>
                {options !== '' && <T dim style={styles.small}>{options}</T>}
                <View style={styles.rowBottom}>
                  <T style={styles.name}>{rub(unit * line.qty)}</T>
                  <Stepper value={line.qty} onChange={(qty) => set((s) => ({ cart: setQty(s.cart, key, qty) }))} />
                </View>
              </View>
            </View>
          ))}
          {/* Кнопка в потоке, а не прибита к низу: так она не спорит с нативным таб-баром */}
          <Button
            title={`Оформить · ${rub(subtotal)}`}
            onPress={() => router.push(profile ? '/checkout' : '/login?next=checkout')}
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  small: { fontSize: 14 },
  content: { padding: Spacing.three, gap: Spacing.three },
  row: { flexDirection: 'row', gap: Spacing.three },
  rowBody: { flex: 1, gap: Spacing.one },
  rowBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.one },
  name: { fontSize: 17, fontWeight: '600' },
});
