import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

export interface FavouriteItem {
  id: string; // productUnitId as string (format: productId_unitId) or productId
  productId: number;
  unitId?: number;
  name: string;
  price: string;
  desc: string;
  image?: any;
  productUnitId?: number;
  categoryId?: number;
}

interface FavouriteState { items: FavouriteItem[] }
type Listener = () => void;

class FavouriteStoreImpl {
  private state: FavouriteState = { items: [] };
  private listeners = new Set<Listener>();
  private readonly KEY = 'favourite_items_v1';

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

  addItem(item: FavouriteItem){
    const itemsCopy = [...this.state.items];
    const idx = itemsCopy.findIndex(i => i.id === item.id);
    if(idx < 0){
      itemsCopy.push(item);
      this.state = { items: itemsCopy };
      this.notify(); this.persist();
    }
  }

  removeItem(id: string){
    const itemsCopy = this.state.items.filter(i => i.id !== id);
    this.state = { items: itemsCopy };
    this.notify(); this.persist();
  }

  toggleItem(item: FavouriteItem){
    const idx = this.state.items.findIndex(i => i.id === item.id);
    if(idx >= 0){
      this.removeItem(item.id);
      return false; // Removed
    } else {
      this.addItem(item);
      return true; // Added
    }
  }

  isFavourite(id: string): boolean{
    return this.state.items.some(i => i.id === id);
  }

  clear(){ this.state = { items: [] }; this.notify(); this.persist(); }
}

const store = new FavouriteStoreImpl();
export const FavouriteStore = {
  useFavourites(){
    const subscribe = (l: Listener)=>store.subscribe(l);
    const getSnapshot = ()=>store.getSnapshot();
    const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return state;
  },
  addItem: store.addItem.bind(store),
  removeItem: store.removeItem.bind(store),
  toggleItem: store.toggleItem.bind(store),
  isFavourite: store.isFavourite.bind(store),
  clear: store.clear.bind(store),
};

