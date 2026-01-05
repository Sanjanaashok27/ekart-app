import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items: any[] = [];

  addToCart(product: any) {
    this.items.push(product);
    alert(`${product.title} has been added to your cart!`);
  }

  getItems() {
    return this.items;
  }
}