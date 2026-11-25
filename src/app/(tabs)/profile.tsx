import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Card, Empty, Field, T, Title } from '@/components/ui';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPhone } from '@/lib/core';
import { useStore } from '@/lib/store';

export default function ProfileScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, set } = useStore();
  const bottom = insets.bottom + BottomTabInset + Spacing.three;

  const logout = () =>
    Alert.alert('Выйти из профиля?', 'Корзина сохранится.', [
      { text: 'Отмена', style: 'cancel' },
      { text: 'Выйти', style: 'destructive', onPress: () => set(() => ({ profile: null })) },
    ]);

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.background }]}>
      {!profile ? (
        <View style={[styles.flex, { paddingBottom: bottom }]}>
          <Empty title="Профиль" text="Войдите по номеру телефона, чтобы оформлять заказы и видеть их историю.">
            <Button title="Войти" onPress={() => router.push('/login')} />
          </Empty>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: bottom }]}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets>
          <Title>Профиль</Title>
          <Card>
            <T dim style={styles.small}>Телефон</T>
            <T style={styles.strong}>{formatPhone(profile.phone)}</T>
          </Card>
          <Field
            accessibilityLabel="Имя"
            placeholder="Как к вам обращаться"
            value={profile.name}
            onChangeText={(name) => set(() => ({ profile: { ...profile, name } }))}
            autoComplete="given-name"
            textContentType="givenName"
            returnKeyType="done"
          />
          <Button variant="secondary" title="Выйти" onPress={logout} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  small: { fontSize: 14 },
  strong: { fontSize: 17, fontWeight: '600' },
  content: { padding: Spacing.three, gap: Spacing.three },
});
