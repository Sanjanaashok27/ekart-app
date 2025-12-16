import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductList } from './product-list/product-list';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, ProductList],
  templateUrl: './customer.html',
  styleUrls: ['./customer.css'],
})
export class Customer {
  showProducts = false;

  toggleProducts() {
    this.showProducts = !this.showProducts;
  }

}
