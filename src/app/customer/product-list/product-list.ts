import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css'],
})
export class ProductList implements OnInit {
  products: any[] = [];
  loading = false;
  error: string | null = null;
  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    this.loading = true;
    
    this.http.get('https://api.mydummyapi.com/categories/products').subscribe((res: any) => 
      {
      this.products = res.products || res;
      console.log(this.products);
      this.loading = false;

      this.error = null;
    }, (err) => {
      this.loading = false;
      this.error = 'Failed to load products';
      console.error('ProductList error', err);
    });
  }

}
