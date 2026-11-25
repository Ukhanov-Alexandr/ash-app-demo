// Веб-вариант (демо в браузере): нативных вкладок в браузере нет, поэтому обычный нижний таб-бар.
import { Tabs } from 'expo-router';
import { SymbolView, type AndroidSymbol } from 'expo-symbols';
import type { ColorValue } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { cartView, useStore } from '@/lib/store';

const icon = (name: AndroidSymbol) =>
  function TabIcon({ color }: { color: ColorValue }) {
    return <SymbolView name={{ web: name }} tintColor={color} size={26} />;
  };

export default function AppTabs() {
  const theme = useTheme();
  const { count } = cartView(useStore().cart);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.backgroundElement },
        tabBarBadgeStyle: { backgroundColor: theme.accent, color: theme.onAccent },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Меню', tabBarIcon: icon('restaurant') }} />
      <Tabs.Screen name="cart" options={{ title: 'Корзина', tabBarIcon: icon('shopping_cart'), tabBarBadge: count || undefined }} />
      <Tabs.Screen name="orders" options={{ title: 'Заказы', tabBarIcon: icon('receipt_long') }} />
      <Tabs.Screen name="profile" options={{ title: 'Профиль', tabBarIcon: icon('person') }} />
    </Tabs>
  );
}
