// Позиции, составы и цены — с меню-доски «Аш» (фото из 2ГИС). Перед запуском сверить с актуальным меню.
// Напитков нет: на доске «наличие и цены уточняйте при заказе».

export type Option = { id: string; name: string; price: number };

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  emoji: string; // заглушка вместо фото, пока нет качественных снимков
  price: number; // базовая цена; размер и добавки прибавляются к ней
  sizes?: Option[];
  sauces?: Option[]; // соус внутри, один на выбор
  addons?: Option[];
};

export type Branch = { id: string; town: string; address: string; hours: string };

export const categories = [
  { id: 'shawarma', name: 'Шаурма' },
  { id: 'doster', name: 'Достер' },
  { id: 'snacks', name: 'Закуски' },
  { id: 'chicken', name: 'Курица' },
  { id: 'hotdog', name: 'Хот-доги' },
  { id: 'sauces', name: 'Соусы' },
];

const SAUCE_PRICE = 30;
const sauceNames = { tomato: 'Томатный', bbq: 'Барбекю', garlic: 'Чесночный', cheese: 'Сырный' };

/** Соус отдельно к любому блюду — те же соусы, что продаются по 30 ₽. */
const dips: Option[] = Object.entries(sauceNames).map(([id, name]) => ({
  id, name: `Соус ${name.toLowerCase()}`, price: SAUCE_PRICE,
}));

const wrapSauces: Option[] = [
  { id: 'garlic', name: 'Чесночный', price: 0 },
  { id: 'hot', name: 'Острый', price: 0 },
  { id: 'classic', name: 'Классический', price: 0 },
];

const shawarma = (id: string, name: string, description: string, price = 240, big = 280): Product => ({
  id, categoryId: 'shawarma', name, description, emoji: '🌯', price,
  sizes: [
    { id: 'm', name: 'М · 300 г', price: 0 },
    { id: 'b', name: 'Б · 400 г', price: big - price },
  ],
  sauces: wrapSauces,
  addons: dips,
});

const doster = (id: string, name: string, description: string): Product => ({
  id, categoryId: 'doster', name, description: `${description}. 240 г`, emoji: '🌯', price: 200, addons: dips,
});

/** Порции «N шт — цена»: первая — базовая. */
const portions = (unit: string, list: [number, number][]): Pick<Product, 'price' | 'sizes'> => ({
  price: list[0][1],
  sizes: list.map(([n, price]) => ({ id: String(n), name: `${n} ${unit}`, price: price - list[0][1] })),
});

export const products: Product[] = [
  shawarma('sh-classic', 'Классическая', 'Цыплёнок, томаты, огурцы, капуста, соус'),
  shawarma('sh-fries', 'С картофелем фри', 'Цыплёнок, томаты, огурцы, капуста, картофель фри, соус'),
  shawarma('sh-carrot', 'С морковью по-корейски', 'Цыплёнок, картофель фри, морковь по-корейски, капуста, соус'),
  shawarma('sh-village', 'Деревенская', 'Цыплёнок, томаты, капуста, морковь по-корейски, огурцы, картофель фри, соус'),
  shawarma('sh-pickles', 'С солёными огурцами', 'Цыплёнок, томаты, капуста, солёные огурцы, картофель фри, соус'),
  shawarma('sh-cheese', 'Сырная', 'Цыплёнок, томаты, огурцы, капуста, сыр, картофель фри, соус'),
  shawarma('sh-hawaii', 'Гавайская', 'Цыплёнок, картофель фри, сыр, ананасы, соус', 250, 300),

  doster('ds-cheese', 'Сырный', 'Цыплёнок, томаты, сыр моцарелла, соус'),
  doster('ds-hawaii', 'Гавайский', 'Цыплёнок, ананасы, сыр моцарелла, соус'),
  doster('ds-pepperoni', 'Пепперони', 'Цыплёнок, пепперони, томаты, картофель фри, солёные огурцы, соус'),
  doster('ds-hot', 'Острый', 'Цыплёнок, томаты, перец халапеньо, огурцы, картофель фри, соус'),

  {
    id: 'sn-fries', categoryId: 'snacks', name: 'Картофель фри', description: 'Хрустящий, с солью', emoji: '🍟',
    price: 120,
    sizes: [
      { id: 's', name: 'S · 100 г', price: 0 },
      { id: 'm', name: 'M · 200 г', price: 100 },
      { id: 'l', name: 'L · 300 г', price: 180 },
    ],
    addons: dips,
  },
  {
    id: 'sn-sticks', categoryId: 'snacks', name: 'Сырные палочки', description: 'Тянущийся сыр в хрустящей панировке', emoji: '🧀',
    ...portions('шт', [[6, 159], [12, 299], [18, 399]]), addons: dips,
  },
  { id: 'sn-rings', categoryId: 'snacks', name: 'Луковые кольца', description: '100 г', emoji: '🧅', price: 89, addons: dips },

  {
    id: 'ch-wings', categoryId: 'chicken', name: 'Крылышки', description: 'Куриные крылья в хрустящей панировке', emoji: '🍗',
    ...portions('шт', [[6, 240], [12, 480], [18, 720], [24, 860], [30, 980]]), addons: dips,
  },
  {
    id: 'ch-nuggets', categoryId: 'chicken', name: 'Нагетсы', description: 'Куриное филе в панировке', emoji: '🍗',
    ...portions('шт', [[8, 200], [12, 280], [16, 340]]), addons: dips,
  },
  {
    id: 'ch-strips', categoryId: 'chicken', name: 'Стрипсы', description: 'Полоски куриного филе в панировке', emoji: '🍗',
    ...portions('шт', [[4, 169], [8, 319], [12, 449]]), addons: dips,
  },

  // На доске составы этих двух хот-догов, похоже, перепутаны местами — здесь сопоставлены с названиями. Уточнить.
  {
    id: 'hd-carrot', categoryId: 'hotdog', name: 'С морковью по-корейски', emoji: '🌭', price: 120,
    description: 'Булочка, сосиска, морковь по-корейски, сыр моцарелла, соус, соус барбекю', addons: dips,
  },
  {
    id: 'hd-pickles', categoryId: 'hotdog', name: 'С солёными огурцами', emoji: '🌭', price: 120,
    description: 'Булочка, сосиска, солёные или маринованные огурцы, сыр моцарелла, соус барбекю', addons: dips,
  },

  ...Object.entries(sauceNames).map(([id, name]): Product => ({
    id: `sc-${id}`, categoryId: 'sauces', name, description: 'Порционный соус', emoji: '🥫', price: SAUCE_PRICE,
  })),
];

export const findProduct = (id: string) => products.find((p) => p.id === id);

// Адреса из 2ГИС. Часы работы подтверждены только для Кызыл-Озёка; Улаган — уточнить, что это точка сети.
export const branches: Branch[] = [
  { id: 'kyzyl-ozek', town: 'Кызыл-Озёк', address: 'ул. Советская, 100', hours: '10:00–20:00' },
  { id: 'kosh-agach', town: 'Кош-Агач', address: 'ул. Кооперативная, 33а', hours: '10:00–20:00' },
  { id: 'ulagan', town: 'Улаган', address: 'ул. Подгорная, 3а', hours: '10:00–20:00' },
];

export const findBranch = (id: string) => branches.find((b) => b.id === id) ?? branches[0];
