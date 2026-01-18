
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private key = 'products';
  private products: Product[] = [];
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();
  private storageMode: 'local' | 'session' | 'none' = 'local';

  constructor() {
    // try localStorage, fall back to sessionStorage, otherwise use defaults
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(this.key);
      if (raw) this.storageMode = 'local';
      else {
        raw = sessionStorage.getItem(this.key);
        if (raw) this.storageMode = 'session';
        else this.storageMode = 'local';
      }
    } catch (e) {
      // reading storage failed (private mode, permission); fall back to session
      try {
        raw = sessionStorage.getItem(this.key);
        if (raw) this.storageMode = 'session';
        else this.storageMode = 'none';
      } catch (_e) {
        this.storageMode = 'none';
      }
    }

    if (raw) {
      try {
        this.products = JSON.parse(raw) as Product[];
      } catch (_e) {
        this.products = [];
      }
    }

    if (!this.products || this.products.length === 0) {
      this.products = [
        { id: Date.now(), name: 'Demo Product A', price: 999, category: 'General', source: 'local' },
        { id: Date.now() + 1, name: 'Demo Product B', price: 1499, category: 'General', source: 'local' }
      ];
    }
    this.emit();
  }

  getAll(): Product[] {
    return [...this.products];
  }

  add(product: Omit<Product, 'id' | 'source'>): void {
    const newProduct: Product = { id: Date.now(), ...product, source: 'local' };
    this.products.push(newProduct);
    this.save();
  }

  update(id: number | string, updated: Omit<Product, 'id' | 'source'>): void {
    const i = this.products.findIndex(p => p.id === id);
    if (i !== -1) {
      this.products[i] = { id, ...updated, source: 'local' };
      this.save();
    }
  }

  delete(id: number | string): void {
    this.products = this.products.filter(p => p.id !== id);
    this.save();
  }

  private save(): void {
    const payload = JSON.stringify(this.products);
    // try localStorage first
    try {
      localStorage.setItem(this.key, payload);
      this.storageMode = 'local';
    } catch (e) {
      // quota or other storage error - try sessionStorage
      try {
        sessionStorage.setItem(this.key, payload);
        this.storageMode = 'session';
      } catch (se) {
        // give up persisting, keep in-memory only
        this.storageMode = 'none';
        console.warn('ProductService: failed to persist products to local/session storage, continuing in-memory only.', se);
      }
    }
    this.emit();
  }

  private emit(): void {
    this.productsSubject.next([...this.products]);
  }
}
