import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, SectionList, StyleSheet, View, type ListViewToken } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProductImage, T } from '@/components/ui';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { categories, products } from '@/data/menu';
import { useTheme } from '@/hooks/use-theme';
import { rub } from '@/lib/core';
import { deliverySummary, useStore } from '@/lib/store';

const sections = categories.map((c) => ({ ...c, data: products.filter((p) => p.categoryId === c.id) }));

export default function MenuScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const summary = deliverySummary(useStore().delivery);
  const list = useRef<SectionList<(typeof products)[number], (typeof sections)[number]>>(null);
  const [active, setActive] = useState(categories[0].id);

  // Категория сверху экрана подсвечивается в ленте при прокрутке.
  const onViewable = useCallback(({ viewableItems }: { viewableItems: ListViewToken[] }) => {
    const top = viewableItems.find((v) => v.section);
    if (top) setActive(top.section.id);
  }, []);

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: theme.background }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${summary.title}: ${summary.text}. Изменить`}
        onPress={() => router.push('/delivery')}
        style={styles.delivery}>
        <Image accessibilityLabel="Аш — вкусное место" source={require('@/assets/images/logo.png')} contentFit="contain" style={styles.logo} />
        <View style={styles.flex}>
          <T dim style={styles.small}>{summary.title}</T>
          <T numberOfLines={1} style={styles.deliveryText}>{summary.text}</T>
        </View>
        <T dim style={styles.chevron}>›</T>
      </Pressable>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {sections.map((c, i) => {
            const selected = c.id === active;
            return (
              <Pressable
                key={c.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => list.current?.scrollToLocation({ sectionIndex: i, itemIndex: 0 })}
                style={[styles.chip, { backgroundColor: selected ? theme.accent : theme.backgroundElement }]}>
                <T style={[styles.chipText, selected && { color: theme.onAccent }]}>{c.name}</T>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <SectionList
        ref={list}
        sections={sections}
        keyExtractor={(p) => p.id}
        stickySectionHeadersEnabled={false}
        // shortcut: рендерим всё меню сразу, чтобы прыжок к категории не промахивался; при 100+ позициях добавить getItemLayout
        initialNumToRender={products.length + sections.length}
        onScrollToIndexFailed={() => {}}
        onViewableItemsChanged={onViewable}
        viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
        contentContainerStyle={{ paddingHorizontal: Spacing.three, paddingBottom: insets.bottom + BottomTabInset + Spacing.three }}
        renderSectionHeader={({ section }) => (
          <T accessibilityRole="header" style={styles.section}>{section.name}</T>
        )}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push(`/product/${item.id}`)}
            style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]}>
            <ProductImage emoji={item.emoji} size={96} />
            <View style={styles.rowBody}>
              <T style={styles.name}>{item.name}</T>
              <T dim numberOfLines={2} style={styles.small}>{item.description}</T>
              <View style={[styles.price, { backgroundColor: theme.backgroundElement }]}>
                <T style={styles.priceText}>
                  {item.sizes ? 'от ' : ''}
                  {rub(item.price)}
                </T>
              </View>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  small: { fontSize: 14 },
  logo: { width: 72, height: 44, borderRadius: 10, backgroundColor: '#D7D7D7' }, // фон — как у файла логотипа
  delivery: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, minHeight: 52 },
  deliveryText: { fontSize: 17, fontWeight: '600' },
  chevron: { fontSize: 24, paddingLeft: Spacing.two },
  chips: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, gap: Spacing.two },
  chip: { paddingHorizontal: Spacing.three, minHeight: 40, borderRadius: 20, justifyContent: 'center' },
  chipText: { fontSize: 15, fontWeight: '600' },
  section: { fontSize: 22, fontWeight: '700', paddingTop: Spacing.three, paddingBottom: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.three, paddingVertical: Spacing.two },
  rowBody: { flex: 1, gap: Spacing.one, alignItems: 'flex-start', justifyContent: 'center' },
  name: { fontSize: 17, fontWeight: '600' },
  price: { borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, marginTop: Spacing.one },
  priceText: { fontSize: 15, fontWeight: '600' },
});
