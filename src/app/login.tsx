import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { Button, Field, T, Title } from '@/components/ui';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatPhone, parsePhone } from '@/lib/core';
import { useStore } from '@/lib/store';

const CODE_LENGTH = 4;

export default function LoginScreen() {
  const theme = useTheme();
  const { set } = useStore();
  const { next } = useLocalSearchParams<{ next?: string }>();
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');

  // shortcut: СМС не отправляется, подходит любой код; с бэкендом — запрос и проверка кода на сервере.
  const onCode = (text: string) => {
    if (text.replace(/\D/g, '').length < CODE_LENGTH) return;
    set((s) => ({ profile: { phone, name: s.profile?.name ?? '' } }));
    if (next === 'checkout') router.replace('/checkout');
    else router.back();
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled">
      {step === 'phone' ? (
        <>
          <Title>Ваш номер</Title>
          <T dim>Пришлём код в СМС. По номеру сохраним заказы и свяжемся, если что-то уточнить.</T>
          <Field
            key="phone" // разные key: иначе React переиспользует поле между шагами вместе со значением
            accessibilityLabel="Номер телефона"
            autoFocus
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            value={formatPhone(phone)}
            onChangeText={(t) => setPhone(parsePhone(t))}
            style={styles.big}
          />
          <Button title="Получить код" disabled={phone.length < 10} onPress={() => setStep('code')} />
        </>
      ) : (
        <>
          <Title>Код из СМС</Title>
          <T dim>Отправили на {formatPhone(phone)}. В прототипе подойдут любые {CODE_LENGTH} цифры.</T>
          <Field
            key="code"
            accessibilityLabel="Код из СМС"
            autoFocus
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={CODE_LENGTH}
            placeholder="••••"
            onChangeText={onCode}
            style={[styles.big, styles.code]}
          />
          <Button variant="secondary" title="Изменить номер" onPress={() => setStep('phone')} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: Spacing.three, gap: Spacing.three },
  big: { fontSize: 22, fontWeight: '600' },
  code: { letterSpacing: 8, textAlign: 'center' },
});
