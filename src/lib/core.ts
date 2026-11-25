// Чистая логика без React: корзина, цены, телефон. Проверяется в core.test.mjs.
import type { Product } from '@/data/menu';

export type CartLine = { productId: string; sizeId?: string; sauceId?: string; addonIds: string[]; qty: number };

/** Одинаковый товар с одинаковыми опциями — одна строка корзины. */
export const lineKey = (l: Omit<CartLine, 'qty'>) =>
  [l.productId, l.sizeId ?? '', l.sauceId ?? '', ...[...l.addonIds].sort()].join('|');

export function unitPrice(p: Product, l: Omit<CartLine, 'qty'>) {
  const size = p.sizes?.find((s) => s.id === l.sizeId)?.price ?? 0;
  const addons = (p.addons ?? [])
    .filter((a) => l.addonIds.includes(a.id))
    .reduce((sum, a) => sum + a.price, 0);
  return p.price + size + addons;
}

export function optionsText(p: Product, l: Omit<CartLine, 'qty'>) {
  const size = p.sizes?.find((s) => s.id === l.sizeId)?.name;
  const sauce = p.sauces?.find((s) => s.id === l.sauceId)?.name;
  const addons = (p.addons ?? []).filter((a) => l.addonIds.includes(a.id)).map((a) => `+ ${a.name.toLowerCase()}`);
  return [size, sauce && `соус ${sauce.toLowerCase()}`, ...addons].filter(Boolean).join(', ');
}

export function addLine(cart: CartLine[], line: CartLine): CartLine[] {
  const key = lineKey(line);
  return cart.some((l) => lineKey(l) === key)
    ? cart.map((l) => (lineKey(l) === key ? { ...l, qty: l.qty + line.qty } : l))
    : [...cart, line];
}

/** qty <= 0 удаляет строку. */
export function setQty(cart: CartLine[], key: string, qty: number): CartLine[] {
  return qty <= 0
    ? cart.filter((l) => lineKey(l) !== key)
    : cart.map((l) => (lineKey(l) === key ? { ...l, qty } : l));
}

// Условия доставки временные — уточнить у заказчика.
export const DELIVERY_FEE = 150;
export const FREE_DELIVERY_FROM = 1000;

export const deliveryFee = (mode: 'pickup' | 'delivery', subtotal: number) =>
  mode === 'delivery' && subtotal < FREE_DELIVERY_FROM ? DELIVERY_FEE : 0;

export const rub = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';

/** Из текста поля (всегда начинается с «+7») — до 10 цифр номера без кода страны. */
export function parsePhone(text: string) {
  let d = text.replace(/^\+7/, '').replace(/\D/g, '');
  if (d.length > 10 && (d[0] === '7' || d[0] === '8')) d = d.slice(1); // вставили номер целиком, с 8 или +7
  return d.slice(0, 10);
}

export function formatPhone(digits: string) {
  const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)];
  return '+7' + parts.map((p, i) => (p ? (i < 2 ? ' ' : '-') + p : '')).join('');
}
