import { NativeTabs } from 'expo-router/native-tabs';

import { useTheme } from '@/hooks/use-theme';
import { cartView, useStore } from '@/lib/store';

export default function AppTabs() {
  const theme = useTheme();
  const { count } = cartView(useStore().cart);

  return (
    <NativeTabs tintColor={theme.tint} backgroundColor={theme.background} badgeBackgroundColor={theme.accent}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Меню</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="fork.knife" md="restaurant" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="cart">
        <NativeTabs.Trigger.Label>Корзина</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="cart" md="shopping_cart" />
        {count > 0 && <NativeTabs.Trigger.Badge>{String(count)}</NativeTabs.Trigger.Badge>}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="orders">
        <NativeTabs.Trigger.Label>Заказы</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="clock" md="receipt_long" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Label>Профиль</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person" md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
