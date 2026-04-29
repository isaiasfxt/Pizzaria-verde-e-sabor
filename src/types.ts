/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PizzaSize = 'P' | 'M' | 'G';

export interface Extra {
  id: string;
  name: string;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Tradicionais' | 'Especiais' | 'Bebidas' | 'Combos';
  sizes?: boolean; // if true, can choose P, M, G
}

export interface CartItem {
  id: string; // instance id for cart
  productId: string;
  name: string;
  price: number;
  size?: PizzaSize;
  extras: Extra[];
  observations: string;
  quantity: number;
  image: string;
}

export interface Order {
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: 'Dinheiro' | 'Pix' | 'Cartão';
  items: CartItem[];
  total: number;
}

export type View = 'home' | 'menu' | 'product_detail' | 'cart' | 'checkout' | 'admin';
