import { Product, Extra } from './types';

export const PIZZARIA_PHONE = "5511999999999"; // Exemplo

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Calabresa Tradicional',
    description: 'Molho de tomate pelado, mussarela, calabresa fatiada, cebola e orégano.',
    price: 35.00,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop',
    category: 'Tradicionais',
    sizes: true
  },
  {
    id: '2',
    name: 'Mussarela',
    description: 'Molho de tomate, muito queijo mussarela de qualidade e orégano.',
    price: 32.00,
    image: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?q=80&w=800&auto=format&fit=crop',
    category: 'Tradicionais',
    sizes: true
  },
  {
    id: '3',
    name: 'Portuguesa Especial',
    description: 'Presunto, ovos, cebola, ervilha, mussarela e palmito.',
    price: 42.00,
    image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=800&auto=format&fit=crop',
    category: 'Especiais',
    sizes: true
  },
  {
    id: '4',
    name: 'Frango com Catupiry',
    description: 'Frango desfiado temperado, milho e o legítimo Catupiry.',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop',
    category: 'Especiais',
    sizes: true
  },
  {
    id: '5',
    name: 'Coca-Cola 2L',
    description: 'Refrigerante gelado 2 litros.',
    price: 12.00,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=800&auto=format&fit=crop',
    category: 'Bebidas'
  },
  {
    id: '6',
    name: 'Combo Família',
    description: '1 Pizza GG + 1 Pizza Doce M + Coca 2L.',
    price: 89.90,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop',
    category: 'Combos'
  }
];

export const PIZZA_EXTRAS: Extra[] = [
  { id: 'borda_catupiry', name: 'Borda de Catupiry', price: 8.00 },
  { id: 'borda_cheddar', name: 'Borda de Cheddar', price: 8.00 },
  { id: 'extra_queijo', name: 'Queijo Extra', price: 5.00 },
  { id: 'bacon', name: 'Bacon Extra', price: 6.00 }
];

export const SIZE_MULTIPLIERS = {
  'P': 0.8,
  'M': 1,
  'G': 1.2
};
