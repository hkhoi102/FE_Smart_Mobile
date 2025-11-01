import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

export interface CartItem {
  id: string; // productUnitId as string (or unique id)
  name: string;
  price: number;
  quantity: number;
  image?: any;
  productUnitId?: number;
  productId?: number;
  categoryId?: number;
}

interface CartState { items: CartItem[] }
type Listener = () => void;

class CartStoreImpl {
  private state: CartState = { items: [] };
  private listeners = new Set<Listener>();
  private readonly KEY = 'cart_items_v2';

  constructor(){ this.hydrate(); }

  private notify(){ this.listeners.forEach(l => l()); }

  private async hydrate(){
    try{
      const raw = await AsyncStorage.getItem(this.KEY);
      if(raw){
        const parsed = JSON.parse(raw);
        if(parsed && Array.isArray(parsed.items)){
          this.state.items = parsed.items;
          this.notify();
        }
      }
    }catch{}
  }

  private async persist(){
    try{ await AsyncStorage.setItem(this.KEY, JSON.stringify(this.state)); }catch{}
  }

  subscribe(l: Listener){ this.listeners.add(l); return () => this.listeners.delete(l); }
  getSnapshot(){ return this.state; }

  addItem(item: Omit<CartItem,'quantity'> & { quantity?: number }){
    const qty = item.quantity ?? 1;
    const itemsCopy = [...this.state.items];
    const idx = itemsCopy.findIndex(i => i.id === item.id);
    if(idx>=0){ itemsCopy[idx] = { ...itemsCopy[idx], quantity: itemsCopy[idx].quantity + qty }; }
    else { itemsCopy.push({ ...item, quantity: qty }); }
    this.state = { items: itemsCopy };
    this.notify(); this.persist();
  }

  removeItem(id: string){
    const itemsCopy = this.state.items.filter(i => i.id !== id);
    this.state = { items: itemsCopy };
    this.notify(); this.persist();
  }

  updateQuantity(id: string, quantity: number){
    if(quantity<1) return;
    const itemsCopy = this.state.items.map(i => i.id===id ? { ...i, quantity } : i);
    this.state = { items: itemsCopy };
    this.notify(); this.persist();
  }

  clear(){ this.state = { items: [] }; this.notify(); this.persist(); }
}

const store = new CartStoreImpl();
export const CartStore = {
  useCart(){
    const subscribe = (l: Listener)=>store.subscribe(l);
    const getSnapshot = ()=>store.getSnapshot();
    const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return state;
  },
  addItem: store.addItem.bind(store),
  removeItem: store.removeItem.bind(store),
  updateQuantity: store.updateQuantity.bind(store),
  clear: store.clear.bind(store),
};


