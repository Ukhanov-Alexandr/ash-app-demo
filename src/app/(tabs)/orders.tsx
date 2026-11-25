import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Empty, T, Title } from '@/components/ui';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { findProduct } from '@/data/menu';
import { useTheme } from '@/hooks/use-theme';
import { addLine, rub } from '@/lib/core';
import { deliverySummary, orderStatus, useStore, type Order } from '@/lib/store';

const formatDate = (ts: number) =>
  new Date(ts).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

export default function OrdersScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { orders, profile, set } = useStore();
  const bottom = insets.bottom + BottomTabInset + Spacing.three;

  // Тик, чтобы статусы активных заказов обновлялись на глазах.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10_000);
    return () => clearInterval(timer);
  }, []);

  const repeat = (order: Order) => {
    set((s) => ({
      cart: order.items.filter((i) => findProduct(i.line.productId)).reduce((cart, i) => addLine(cart, i.line), s.cart),
    }));
    router.navigate('/cart');
  };

  const empty = !profile ? (
    <Empty title="Ваши заказы" text="Войдите по номеру телефона — здесь появятся статус и история заказов.">
      <Button title="Войти" onPress={() => router.push('/login')} />
    </Empty>
  ) : orders.length === 0 ? (
    <Empty title="Заказов пока нет" text="Первый заказ появится здесь сразу после оформления.">
      <Button title="Перейти в меню" onPress={() => router.navigate('/')} />
    </Empty>
  ) : null;

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.background }]}>
      {empty ? (
        <View style={[styles.flex, { paddingBottom: bottom }]}>{empty}</View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          contentContainerStyle={[styles.content, { paddingBottom: bottom }]}
          ListHeaderComponent={<Title>Заказы</Title>}
          renderItem={({ item: order }) => {
            const status = orderStatus(order, now);
            const where = deliverySummary(order.delivery);
            return (
              <Card>
                <View style={styles.head}>
                  <T style={styles.strong}>№ {order.number}</T>
                  <View style={[styles.status, { backgroundColor: status.done ? theme.backgroundSelected : theme.accent }]}>
                    <T style={[styles.statusText, !status.done && { color: theme.onAccent }]}>{status.label}</T>
                  </View>
                </View>
                <T dim style={styles.small}>
                  {formatDate(order.createdAt)} · {where.title}: {where.text}
                </T>
                <View style={styles.items}>
                  {order.items.map((i, n) => (
                    <T key={n}>
                      {i.qty} × {i.title}
                      {i.options !== '' && <T dim> ({i.options.toLowerCase()})</T>}
                    </T>
                  ))}
                </View>
                <View style={styles.head}>
                  <T style={styles.strong}>{rub(order.total)}</T>
                  <Button variant="secondary" title="Повторить" onPress={() => repeat(order)} />
                </View>
              </Card>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  small: { fontSize: 14 },
  strong: { fontSize: 17, fontWeight: '600' },
  content: { padding: Spacing.three, gap: Spacing.three },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  status: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 14, fontWeight: '600' },
  items: { gap: Spacing.one, marginVertical: Spacing.one },
});
