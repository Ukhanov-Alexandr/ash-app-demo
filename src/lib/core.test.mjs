// Запуск: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { products } from '../data/menu.ts';
import { addLine, deliveryFee, formatPhone, lineKey, optionsText, parsePhone, rub, setQty, unitPrice } from './core.ts';

const shawarma = products.find((p) => p.id === 'sh-classic');

test('цена = база + размер + добавки; соус внутри бесплатный', () => {
  assert.equal(unitPrice(shawarma, { productId: shawarma.id, addonIds: [] }), 240);
  const line = { productId: shawarma.id, sizeId: 'b', sauceId: 'hot', addonIds: ['cheese', 'bbq'] };
  assert.equal(unitPrice(shawarma, line), 280 + 30 + 30);
  assert.equal(optionsText(shawarma, line), 'Б · 400 г, соус острый, + соус барбекю, + соус сырный');
});

test('цены порций с доски сходятся', () => {
  const wings = products.find((p) => p.id === 'ch-wings');
  const prices = wings.sizes.map((s) => unitPrice(wings, { productId: wings.id, sizeId: s.id, addonIds: [] }));
  assert.deepEqual(prices, [240, 480, 720, 860, 980]);
  const hawaii = products.find((p) => p.id === 'sh-hawaii');
  assert.equal(unitPrice(hawaii, { productId: hawaii.id, sizeId: 'b', addonIds: [] }), 300);
});

test('одинаковые опции склеиваются, разные — нет; порядок добавок не важен', () => {
  const a = { productId: 'sh-classic', sizeId: 'm', sauceId: 'garlic', addonIds: ['cheese', 'bbq'], qty: 1 };
  const b = { ...a, addonIds: ['bbq', 'cheese'], qty: 2 };
  const c = { ...a, sauceId: 'hot' };
  let cart = addLine(addLine(addLine([], a), b), c);
  assert.equal(cart.length, 2);
  assert.equal(cart[0].qty, 3);

  cart = setQty(cart, lineKey(a), 5);
  assert.equal(cart[0].qty, 5);
  cart = setQty(cart, lineKey(a), 0);
  assert.deepEqual(cart, [c]);
});

test('доставка платная до порога, самовывоз бесплатный', () => {
  assert.equal(deliveryFee('delivery', 999), 150);
  assert.equal(deliveryFee('delivery', 1000), 0);
  assert.equal(deliveryFee('pickup', 100), 0);
});

test('форматирование', () => {
  assert.equal(rub(1240), '1 240 ₽');
  assert.equal(rub(99), '99 ₽');
  assert.equal(formatPhone(''), '+7');
  assert.equal(formatPhone('9139941'), '+7 913 994-1');
  assert.equal(formatPhone('9139941118'), '+7 913 994-11-18');
});

test('телефон: набор по цифре и вставка номера целиком', () => {
  assert.equal(parsePhone('+7 913'), '913');
  assert.equal(parsePhone('+7 913 994-11-189'), '9139941118');
  assert.equal(parsePhone('+789139941118'), '9139941118');
  assert.equal(parsePhone('+7+7 913 994 11 18'), '9139941118');
  assert.equal(parsePhone('+'), '');
});
