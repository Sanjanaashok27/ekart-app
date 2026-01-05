
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private key = 'products';
  private products: Product[] = [];
  private productsSubject = new BehaviorSubject<Product[]>([]);
  products$ = this.productsSubject.asObservable();

  constructor() {
    const saved = localStorage.getItem(this.key);
    this.products = saved ? JSON.parse(saved) : [
      { id: Date.now(), name: 'Demo Product A', price: 999, category: 'General', source: 'local' },
      { id: Date.now() + 1, name: 'Demo Product B', price: 1499, category: 'General', source: 'local' }
    ];
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
    localStorage.setItem(this.key, JSON.stringify(this.products));
    this.emit();
  }

  private emit(): void {
    this.productsSubject.next([...this.products]);
  }
}
