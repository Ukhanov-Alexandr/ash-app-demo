import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, CheckRow, Field, T, TotalRow } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { deliveryFee, formatPhone, rub } from '@/lib/core';
import { cartView, deliverySummary, useStore, type Payment } from '@/lib/store';

export default function CheckoutScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { cart, delivery, profile, set } = useStore();
  const [payment, setPayment] = useState<Payment>('card');
  const [comment, setComment] = useState('');

  const { lines, subtotal } = cartView(cart);
  const [placed, setPlaced] = useState(false);
  if (placed) return null; // корзина уже очищена, уходим на «Заказы» — редирект в корзину не нужен
  if (!profile || lines.length === 0) return <Redirect href="/cart" />;

  const summary = deliverySummary(delivery);
  const needsAddress = delivery.mode === 'delivery' && !delivery.address.trim();
  const fee = deliveryFee(delivery.mode, subtotal);
  const total = subtotal + fee;

  const placeOrder = () => {
    setPlaced(true);
    set((s) => ({
      cart: [],
      orders: [
        {
          id: String(Date.now()),
          number: s.orders.length + 1,
          createdAt: Date.now(),
          items: lines.map((l) => ({ title: l.product.name, options: l.options, qty: l.line.qty, price: l.unit, line: l.line })),
          deliveryFee: fee,
          total,
          delivery,
          payment,
          comment: comment.trim(),
        },
        ...s.orders,
      ],
    }));
    if (router.canDismiss()) router.dismissAll();
    router.navigate('/orders');
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.three }]}
      keyboardShouldPersistTaps="handled"
      automaticallyAdjustKeyboardInsets>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${summary.title}: ${summary.text}. Изменить`}
        onPress={() => router.push('/delivery')}>
        <Card style={styles.linkCard}>
          <View style={styles.flex}>
            <T dim style={styles.small}>{summary.title}</T>
            <T style={styles.strong}>{summary.text}</T>
          </View>
          <T dim style={styles.chevron}>›</T>
        </Card>
      </Pressable>

      <Card>
        <T dim style={styles.small}>Телефон для связи</T>
        <T style={styles.strong}>{formatPhone(profile.phone)}</T>
      </Card>

      <View>
        <T accessibilityRole="header" style={styles.subtitle}>Оплата при получении</T>
        <CheckRow kind="radio" title="Картой" selected={payment === 'card'} onPress={() => setPayment('card')} />
        <CheckRow kind="radio" title="Наличными" selected={payment === 'cash'} onPress={() => setPayment('cash')} />
      </View>

      <Field
        accessibilityLabel="Комментарий к заказу"
        placeholder="Комментарий: без лука, код домофона…"
        value={comment}
        onChangeText={setComment}
        multiline
        maxLength={300}
      />

      <View style={styles.totals}>
        <TotalRow label={`Товары, ${lines.reduce((n, l) => n + l.line.qty, 0)} шт`} value={rub(subtotal)} />
        {delivery.mode === 'delivery' && <TotalRow label="Доставка" value={fee ? rub(fee) : 'Бесплатно'} />}
        <TotalRow bold label="Итого" value={rub(total)} />
      </View>

      <T dim style={[styles.small, styles.center]}>Это прототип: заказ никуда не отправится.</T>
      <Button title={needsAddress ? 'Укажите адрес доставки' : `Заказать · ${rub(total)}`} onPress={needsAddress ? () => router.push('/delivery') : placeOrder} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  small: { fontSize: 14 },
  center: { textAlign: 'center' },
  strong: { fontSize: 17, fontWeight: '600' },
  content: { padding: Spacing.three, gap: Spacing.three },
  linkCard: { flexDirection: 'row', alignItems: 'center' },
  chevron: { fontSize: 24, paddingLeft: Spacing.two },
  subtitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.one },
  totals: { gap: Spacing.two, marginTop: Spacing.two },
});
