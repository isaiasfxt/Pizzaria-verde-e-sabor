/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  ShoppingBag, 
  ChevronLeft, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  PlusCircle, 
  Settings,
  Pizza,
  Home as HomeIcon,
  Search,
  Check
} from 'lucide-react';
import { 
  View, 
  Product, 
  CartItem, 
  PizzaSize, 
  Extra, 
  Order 
} from './types';
import { 
  INITIAL_PRODUCTS, 
  PIZZA_EXTRAS, 
  SIZE_MULTIPLIERS, 
  PIZZARIA_PHONE 
} from './constants';

export default function App() {
  // State
  const [view, setView] = useState<View>('home');
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pizza_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('pizza_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem('pizza_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pizza_cart', JSON.stringify(cart));
  }, [cart]);

  // Derived state
  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  // Handlers
  const addToCart = (item: CartItem) => {
    setCart(prev => {
      // Simple duplicate detection: same product, size, extras, and observations
      const existing = prev.find(p => 
        p.productId === item.productId && 
        p.size === item.size && 
        JSON.stringify(p.extras) === JSON.stringify(item.extras) &&
        p.observations === item.observations
      );

      if (existing) {
        return prev.map(p => p === existing ? { ...p, quantity: p.quantity + item.quantity } : p);
      }
      return [...prev, item];
    });
    
    setShowConfirmation(true);
    setTimeout(() => setShowConfirmation(false), 2000);
    setView('menu');
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setView('product_detail');
  };

  const goHome = () => setView('home');
  const goMenu = () => setView('menu');
  const goCart = () => setView('cart');
  const goCheckout = () => setView('checkout');
  const goAdmin = () => setView('admin');

  // Animation variants
  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    enter: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="mobile-container overflow-hidden flex flex-col">
      {/* Toast Notification */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4"
          >
            <div className="bg-primary text-white px-6 py-3 rounded-full flex items-center gap-2 shadow-xl border border-white/20">
              <CheckCircle2 size={20} />
              <span className="font-medium">Adicionado ao carrinho!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative pt-4 pb-24">
        <AnimatePresence mode="wait">
          {view === 'home' && <Home key="home" onStart={goMenu} onAdmin={goAdmin} products={products} onSelect={handleProductSelect} />}
          {view === 'menu' && <Menu key="menu" products={products} onSelect={handleProductSelect} onBack={goHome} />}
          {view === 'product_detail' && selectedProduct && (
            <ProductDetail 
              key="detail" 
              product={selectedProduct} 
              onBack={goMenu} 
              onAdd={addToCart} 
            />
          )}
          {view === 'cart' && (
            <Cart 
              key="cart" 
              items={cart} 
              onUpdateQty={updateQuantity} 
              onRemove={removeFromCart} 
              onCheckout={goCheckout} 
              onBack={goMenu}
              total={cartTotal}
            />
          )}
          {view === 'checkout' && (
            <Checkout 
              key="checkout" 
              cart={cart} 
              total={cartTotal} 
              onBack={goCart} 
              onSuccess={clearCart} 
              goHome={goHome}
            />
          )}
          {view === 'admin' && (
            <Admin 
              key="admin" 
              products={products} 
              onUpdateProducts={setProducts} 
              onBack={goHome} 
            />
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-white border-t border-gray-100 flex justify-around items-center py-4 px-6 z-40 safe-area-inset-bottom">
        <NavButton icon={<HomeIcon size={24} />} label="Início" active={view === 'home'} onClick={goHome} />
        <NavButton icon={<Pizza size={24} />} label="Cardápio" active={view === 'menu' || view === 'product_detail'} onClick={goMenu} />
        <NavButton 
          icon={<ShoppingBag size={24} />} 
          label="Carrinho" 
          active={view === 'cart'} 
          onClick={goCart} 
          badge={cartCount}
        />
        <NavButton icon={<Settings size={24} />} label="Admin" active={view === 'admin'} onClick={goAdmin} />
      </nav>
    </div>
  );
}

// Helper Components
function NavButton({ icon, label, active, onClick, badge }: { icon: any, label: string, active: boolean, onClick: () => void, badge?: number }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 relative">
      <div className={`transition-colors duration-200 ${active ? 'text-primary' : 'text-gray-400'}`}>
        {icon}
      </div>
      <span className={`text-[10px] uppercase tracking-wider font-semibold ${active ? 'text-primary' : 'text-gray-400'}`}>
        {label}
      </span>
      {badge ? (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

// --- SCREENS ---

function Home({ onStart, onAdmin, products, onSelect }: any) {
  const highlights = products.filter((p: any) => p.category === 'Especiais').slice(0, 3);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-6"
    >
      <div className="flex flex-col items-center py-8">
        <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white mb-4 pizza-glow">
          <Pizza size={48} strokeWidth={2.5} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-center">
          Pizzaria <span className="text-primary tracking-tighter">Verde & Sabor</span>
        </h1>
        <p className="text-gray-500 text-center mt-2 font-medium">A verdadeira pizza artesanal no seu WhatsApp</p>
      </div>

      {/* Banner */}
      <div className="bg-black rounded-3xl overflow-hidden relative p-8 mb-8 text-white">
        <div className="relative z-10">
          <span className="bg-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2 inline-block">Oferta do Dia</span>
          <h2 className="text-2xl font-bold mb-1">Combo Especial</h2>
          <p className="text-gray-400 text-sm mb-4">Pizza Portuguesa G + Coca 2L</p>
          <div className="text-3xl font-bold text-primary mb-6">R$ 54,90</div>
          <button 
            onClick={onStart}
            className="bg-white text-black font-bold py-3 px-8 rounded-2xl flex items-center gap-2 hover:scale-105 transition-transform"
          >
            Aproveitar <ChevronLeft size={18} className="rotate-180" />
          </button>
        </div>
        {/* Abstract decor */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-primary/20 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-bold">Mais Vendidas</h3>
          <button onClick={onStart} className="text-primary font-bold text-sm">Ver tudo</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {highlights.map((p: any) => (
            <div 
              key={p.id} 
              onClick={() => onSelect(p)}
              className="bg-gray-50 rounded-2xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
            >
              <img src={p.image} alt={p.name} className="w-full h-32 object-cover" />
              <div className="p-3">
                <h4 className="font-bold text-sm truncate">{p.name}</h4>
                <div className="text-primary font-bold">R$ {p.price.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button 
        onClick={onStart}
        className="w-full bg-primary text-white text-lg font-bold py-5 rounded-3xl mb-8 flex items-center justify-center gap-3 pizza-glow active:scale-95 transition-all"
      >
        Fazer Pedido <ShoppingBag size={24} />
      </button>
    </motion.div>
  );
}

function Menu({ products, onSelect, onBack }: any) {
  const [activeCategory, setActiveCategory] = useState('Tradicionais');
  const categories = ['Tradicionais', 'Especiais', 'Bebidas', 'Combos'];

  const filtered = products.filter((p: any) => p.category === activeCategory);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="px-6"
    >
      <div className="flex items-center gap-4 py-4 mb-4">
        <button onClick={onBack} className="p-2 rounded-xl bg-gray-100"><ChevronLeft /></button>
        <h2 className="text-2xl font-bold">Nosso Cardápio</h2>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 -mx-6 px-6">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-6 py-3 rounded-2xl font-bold transition-all ${
              activeCategory === cat 
              ? 'bg-primary text-white shadow-lg shadow-primary/20' 
              : 'bg-gray-100 text-gray-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="space-y-6">
        {filtered.map((p: any) => (
          <div 
            key={p.id}
            onClick={() => onSelect(p)}
            className="flex gap-4 group cursor-pointer active:scale-[0.98] transition-transform"
          >
            <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-md">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <h3 className="font-bold text-lg leading-tight truncate">{p.name}</h3>
              <p className="text-gray-400 text-sm line-clamp-2 mt-1">{p.description}</p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-primary font-bold text-lg">R$ {p.price.toFixed(2)}</span>
                <span className="bg-black text-white p-2 rounded-xl">
                  <Plus size={16} />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ProductDetail({ product, onBack, onAdd }: any) {
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState<PizzaSize>('M');
  const [extras, setExtras] = useState<Extra[]>([]);
  const [observations, setObservations] = useState('');

  const calculateTotal = () => {
    let total = product.price;
    if (product.sizes) {
      total *= SIZE_MULTIPLIERS[size];
    }
    const extrasTotal = extras.reduce((sum, e) => sum + e.price, 0);
    return (total + extrasTotal) * quantity;
  };

  const toggleExtra = (extra: Extra) => {
    setExtras(prev => 
      prev.find(e => e.id === extra.id) 
      ? prev.filter(e => e.id !== extra.id)
      : [...prev, extra]
    );
  };

  const handleAddToCart = () => {
    let basePrice = product.price;
    if (product.sizes) {
      basePrice *= SIZE_MULTIPLIERS[size];
    }
    const extrasTotal = extras.reduce((sum, e) => sum + e.price, 0);

    const cartItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      productId: product.id,
      name: product.name,
      price: basePrice + extrasTotal,
      size: product.sizes ? size : undefined,
      extras,
      observations,
      quantity,
      image: product.image
    };
    onAdd(cartItem);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="relative"
    >
      <div className="relative h-72">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white hover:bg-white/40 transition-colors"
        >
          <ChevronLeft />
        </button>
      </div>

      <div className="bg-white -mt-10 rounded-t-[40px] relative z-10 p-8">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-3xl font-bold leading-tight">{product.name}</h2>
          <div className="text-2xl font-bold text-primary whitespace-nowrap">R$ {product.price.toFixed(2)}</div>
        </div>
        <p className="text-gray-500 mb-8">{product.description}</p>

        {product.sizes && (
          <div className="mb-8">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full block"></span>
              Escolha o Tamanho
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(['P', 'M', 'G'] as PizzaSize[]).map(s => (
                <button 
                  key={s}
                  onClick={() => setSize(s)}
                  className={`py-4 rounded-2xl font-bold transition-all border-2 ${
                    size === s 
                    ? 'bg-primary/5 border-primary text-primary' 
                    : 'bg-white border-gray-100 text-gray-400'
                  }`}
                >
                  {s}
                  <div className="text-[10px] opacity-60 font-medium">
                    {s === 'P' ? '25cm' : s === 'M' ? '30cm' : '35cm'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {product.category !== 'Bebidas' && (
          <div className="mb-8">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full block"></span>
              Extras e Bordas
            </h3>
            <div className="space-y-3">
              {PIZZA_EXTRAS.map(extra => (
                <div 
                  key={extra.id}
                  onClick={() => toggleExtra(extra)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    extras.find(e => e.id === extra.id) 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-50 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
                      extras.find(e => e.id === extra.id) ? 'bg-primary border-primary text-white' : 'bg-white border-gray-200'
                    }`}>
                      {extras.find(e => e.id === extra.id) && <Check size={14} strokeWidth={4} />}
                    </div>
                    <span className={`font-semibold ${extras.find(e => e.id === extra.id) ? 'text-primary' : 'text-gray-700'}`}>
                      {extra.name}
                    </span>
                  </div>
                  <span className="font-bold text-gray-400">+ R$ {extra.price.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-primary rounded-full block"></span>
            Alguma Observação?
          </h3>
          <textarea 
            placeholder="Ex: Tirar cebola, mandar ketchup..."
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-4 mb-20">
          <div className="flex items-center bg-gray-100 rounded-2xl p-1 shrink-0">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-3 text-gray-500"
            >
              <Minus size={20} />
            </button>
            <span className="px-4 font-bold text-lg">{quantity}</span>
            <button 
              onClick={() => setQuantity(q => q + 1)}
              className="p-3 text-primary"
            >
              <Plus size={20} />
            </button>
          </div>
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-primary text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            Adicionar <span className="opacity-50">•</span> R$ {calculateTotal().toFixed(2)}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Cart({ items, onUpdateQty, onRemove, onCheckout, onBack, total }: any) {
  if (items.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="px-6 flex flex-col items-center justify-center min-h-[60vh] text-center"
      >
        <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 mb-6">
          <ShoppingBag size={64} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h2>
        <p className="text-gray-400 mb-8 max-w-[240px]">Que tal escolher uma pizza deliciosa para agora?</p>
        <button 
          onClick={onBack}
          className="bg-primary text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20"
        >
          Ver Cardápio
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="px-6"
    >
      <div className="flex items-center gap-4 py-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl bg-gray-100"><ChevronLeft /></button>
        <h2 className="text-2xl font-bold">Meu Carrinho</h2>
      </div>

      <div className="space-y-6 mb-32">
        {items.map((item: CartItem) => (
          <div key={item.id} className="flex gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-bold truncate pr-2">{item.name} {item.size && `(${item.size})`}</h3>
                <button onClick={() => onRemove(item.id)} className="text-red-400 p-1">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {item.extras.length > 0 ? item.extras.map(e => e.name).join(', ') : 'Sem extras'}
              </div>
              <div className="flex justify-between items-center mt-3">
                <div className="text-primary font-bold">R$ {(item.price * item.quantity).toFixed(2)}</div>
                <div className="flex items-center bg-gray-50 rounded-xl p-0.5 border border-gray-100">
                  <button onClick={() => onUpdateQty(item.id, -1)} className="p-1.5"><Minus size={14} /></button>
                  <span className="px-3 font-bold text-sm">{item.quantity}</span>
                  <button onClick={() => onUpdateQty(item.id, 1)} className="p-1.5"><Plus size={14} className="text-primary"/></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-[500px] mx-auto bg-white p-6 pb-28 border-t border-gray-100 safe-area-inset-bottom">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-400 font-medium">Subtotal</span>
          <span className="text-2xl font-bold">R$ {total.toFixed(2)}</span>
        </div>
        <button 
          onClick={onCheckout}
          className="w-full bg-primary text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          Finalizar Pedido <ChevronLeft size={20} className="rotate-180" />
        </button>
      </div>
    </motion.div>
  );
}

function Checkout({ cart, total, onBack, onSuccess, goHome }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    payment: 'Pix' as any
  });

  const sendWhatsApp = () => {
    if (!formData.name || !formData.phone || !formData.address) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    const productsList = cart.map((item: CartItem) => {
      const extrasStr = item.extras.length > 0 ? ` (${item.extras.map(e => e.name).join(', ')})` : '';
      const obsStr = item.observations ? ` [Obs: ${item.observations}]` : '';
      return `- ${item.quantity}x ${item.name} ${item.size ? `(${item.size})` : ''}${extrasStr}${obsStr}`;
    }).join('\n');

    const message = `*Novo Pedido 🍕*\n\n` +
      `*Nome:* ${formData.name}\n` +
      `*Telefone:* ${formData.phone}\n` +
      `*Endereço:* ${formData.address}\n\n` +
      `*Pedido:*\n${productsList}\n\n` +
      `*Total:* R$ ${total.toFixed(2)}\n` +
      `*Forma de pagamento:* ${formData.payment}`;

    const encoded = encodeURIComponent(message);
    const url = `https://wa.me/${PIZZARIA_PHONE}?text=${encoded}`;

    setTimeout(() => {
      window.open(url, '_blank');
      setLoading(false);
      onSuccess();
      goHome();
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="px-6"
    >
      <div className="flex items-center gap-4 py-4 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl bg-gray-100"><ChevronLeft /></button>
        <h2 className="text-2xl font-bold">Entrega e Pagamento</h2>
      </div>

      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Nome Completo</label>
          <input 
            type="text" 
            placeholder="Como podemos te chamar?"
            className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Seu Telefone / WhatsApp</label>
          <input 
            type="tel" 
            placeholder="(11) 99999-9999"
            className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Endereço de Entrega</label>
          <textarea 
            placeholder="Rua, número, bairro e complemento"
            className="w-full bg-gray-50 border border-gray-100 p-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium min-h-[100px]"
            value={formData.address}
            onChange={e => setFormData({...formData, address: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">Forma de Pagamento</label>
          <div className="grid grid-cols-3 gap-3">
            {['Pix', 'Dinheiro', 'Cartão'].map(method => (
              <button 
                key={method}
                onClick={() => setFormData({...formData, payment: method})}
                className={`py-4 rounded-2xl font-bold transition-all border-2 ${
                  formData.payment === method 
                  ? 'bg-primary/5 border-primary text-primary' 
                  : 'bg-white border-gray-100 text-gray-400'
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-400">Total do Pedido</span>
          <span className="text-xl font-bold">R$ {total.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-400">Entrega grátis para raios de 5km</p>
      </div>

      <button 
        onClick={sendWhatsApp}
        disabled={loading}
        className="w-full bg-primary text-white py-6 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-70"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Processando...
          </div>
        ) : (
          <>Enviar Pedido via WhatsApp <CheckCircle2 size={24} /></>
        )}
      </button>
      <p className="text-center text-xs text-gray-400 mt-4 mb-32">
        Seu pedido será enviado instantaneamente para nossa cozinha.
      </p>
    </motion.div>
  );
}

function Admin({ products, onUpdateProducts, onBack }: any) {
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Product | null>(null);

  const handleEdit = (p: Product) => {
    setIsEditing(p.id);
    setEditForm({...p});
  };

  const handleSave = () => {
    if (editForm) {
      onUpdateProducts(products.map((p: any) => p.id === editForm.id ? editForm : p));
      setIsEditing(null);
      setEditForm(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      onUpdateProducts(products.filter((p: any) => p.id !== id));
    }
  };

  const handleAdd = () => {
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'Nova Pizza',
      description: 'Descrição aqui...',
      price: 30,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=800&auto=format&fit=crop',
      category: 'Tradicionais',
      sizes: true
    };
    onUpdateProducts([...products, newProduct]);
    handleEdit(newProduct);
  };

  if (isEditing && editForm) {
    return (
      <div className="px-6 py-4">
        <h2 className="text-2xl font-bold mb-6">Editar Produto</h2>
        <div className="space-y-4">
          <input 
            className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100" 
            value={editForm.name} 
            onChange={e => setEditForm({...editForm, name: e.target.value})}
            placeholder="Nome"
          />
          <textarea 
            className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100 min-h-[80px]" 
            value={editForm.description} 
            onChange={e => setEditForm({...editForm, description: e.target.value})}
            placeholder="Descrição"
          />
          <div className="flex gap-4">
            <input 
              type="number"
              className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100" 
              value={editForm.price} 
              onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value)})}
              placeholder="Preço R$"
            />
            <select 
              className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100"
              value={editForm.category}
              onChange={e => setEditForm({...editForm, category: e.target.value as any})}
            >
              <option value="Tradicionais">Tradicionais</option>
              <option value="Especiais">Especiais</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Combos">Combos</option>
            </select>
          </div>
          <input 
            className="w-full bg-gray-50 p-4 rounded-xl border border-gray-100" 
            value={editForm.image} 
            onChange={e => setEditForm({...editForm, image: e.target.value})}
            placeholder="URL da Imagem"
          />
          <div className="flex gap-3 pt-4">
            <button onClick={() => setIsEditing(null)} className="flex-1 bg-gray-100 py-4 rounded-xl font-bold">Cancelar</button>
            <button onClick={handleSave} className="flex-1 bg-primary text-white py-4 rounded-xl font-bold">Salvar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6">
      <div className="flex items-center justify-between py-4 mb-6">
        <h2 className="text-2xl font-bold">Painel Admin</h2>
        <button onClick={onBack} className="p-2 rounded-xl bg-gray-100"><ChevronLeft /></button>
      </div>

      <button 
        onClick={handleAdd}
        className="w-full bg-black text-white py-4 rounded-2xl font-bold mb-8 flex items-center justify-center gap-2"
      >
        <PlusCircle size={20} /> Adicionar Novo Produto
      </button>

      <div className="space-y-4 mb-32">
        {products.map((p: any) => (
          <div key={p.id} className="bg-gray-50 p-4 rounded-2xl flex items-center gap-4">
            <img src={p.image} className="w-14 h-14 rounded-xl object-cover" />
            <div className="flex-1">
              <div className="font-bold">{p.name}</div>
              <div className="text-primary font-bold text-sm">R$ {p.price.toFixed(2)}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(p)} className="p-2 bg-white rounded-lg text-primary shadow-sm"><Settings size={18} /></button>
              <button onClick={() => handleDelete(p.id)} className="p-2 bg-white rounded-lg text-red-500 shadow-sm"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
