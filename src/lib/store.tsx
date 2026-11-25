// Всё состояние прототипа лежит на устройстве. С бэкендом этот файл заменится на запросы к API.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { branches, findBranch, findProduct } from '@/data/menu';
import { lineKey, optionsText, unitPrice, type CartLine } from '@/lib/core';

export type Delivery = { mode: 'pickup' | 'delivery'; branchId: string; address: string };
export type Payment = 'card' | 'cash';
export type OrderItem = { title: string; options: string; qty: number; price: number; line: CartLine };
export type Order = {
  id: string;
  number: number;
  createdAt: number;
  items: OrderItem[];
  deliveryFee: number;
  total: number;
  delivery: Delivery;
  payment: Payment;
  comment: string;
};

type State = {
  cart: CartLine[];
  orders: Order[];
  profile: { phone: string; name: string } | null;
  delivery: Delivery;
};

const initial: State = {
  cart: [],
  orders: [],
  profile: null,
  delivery: { mode: 'pickup', branchId: branches[0].id, address: '' },
};

const KEY = 'ash-state-v1';

type Store = State & { set: (fn: (s: State) => Partial<State>) => void };
const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setState({ ...initial, ...JSON.parse(raw) }))
      .catch(() => {}) // битые данные — стартуем с чистого состояния
      .finally(() => {
        setReady(true);
        SplashScreen.hideAsync();
      });
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [ready, state]);

  if (!ready) return null;
  const set: Store['set'] = (fn) => setState((s) => ({ ...s, ...fn(s) }));
  return <Ctx value={{ ...state, set }}>{children}</Ctx>;
}

export function useStore() {
  const store = use(Ctx);
  if (!store) throw new Error('useStore вне StoreProvider');
  return store;
}

/** Строки корзины с товаром и ценой. Позиции, которых уже нет в меню, пропускаются. */
export function cartView(cart: CartLine[]) {
  const lines = cart.flatMap((line) => {
    const product = findProduct(line.productId);
    return product
      ? [{ line, product, key: lineKey(line), unit: unitPrice(product, line), options: optionsText(product, line) }]
      : [];
  });
  return {
    lines,
    count: lines.reduce((n, l) => n + l.line.qty, 0),
    subtotal: lines.reduce((sum, l) => sum + l.unit * l.line.qty, 0),
  };
}

/** «Самовывоз · Кызыл-Озёк, ул. Советская, 100» / «Доставка · Кызыл-Озёк, <адрес>». */
export function deliverySummary(d: Delivery) {
  const branch = findBranch(d.branchId);
  return d.mode === 'pickup'
    ? { title: 'Самовывоз', text: `${branch.town}, ${branch.address}` }
    : { title: 'Доставка', text: d.address.trim() ? `${branch.town}, ${d.address.trim()}` : 'Укажите адрес' };
}

// shortcut: статус считается от времени заказа, чтобы прототип «жил»; заменить статусом с бэкенда.
export function orderStatus(o: Order, now: number) {
  const min = (now - o.createdAt) / 60000;
  const pickup = o.delivery.mode === 'pickup';
  if (min < 1) return { label: 'Принят', done: false };
  if (min < 3) return { label: 'Готовится', done: false };
  if (min < 5) return { label: pickup ? 'Готов к выдаче' : 'В пути', done: false };
  return { label: pickup ? 'Выдан' : 'Доставлен', done: true };
}
