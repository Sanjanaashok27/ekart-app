
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ProductService } from '../services/product.service';
import { Product } from '../models/product';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrls: ['./admin.css']
})
export class Admin implements OnInit {
  products: Product[] = [];
  allProducts: Product[] = [];
  name = '';
  price: any = '';
  category = '';
  description = '';
  editing: Product | null = null;
  private apiItems: Product[] = [];

  constructor(private productService: ProductService, private http: HttpClient) {}

  ngOnInit(): void {
    this.refresh();
    this.loadApi();
    this.productService.products$.subscribe(() => {
      this.refresh();
      this.recombine();
    });
  }

  refresh(): void {
    this.products = this.productService.getAll();
  }

  private loadApi(): void {
    const url = 'https://api.mydummyapi.com/categories/products';
    this.http.get<any[]>(url).subscribe({
      next: (res: any[]) => {
        this.apiItems = (res ?? []).map((item: any, idx: number): Product => ({
          id: item.id ?? `api-${idx}`,
          title: item.title,
          name: item.name ?? item.title ?? 'Untitled',
          price: Number(item.price ?? 0),
          category: item.category ?? item.department ?? 'General',
          department: item.department,
          description: item.description ?? '',
          image: item.image,
          thumbnail: item.thumbnail,
          productId: item.productId,
          sku: item.sku,
          source: 'api'
        }));
        this.recombine();
      },
      error: () => {
        this.http.get<any>('https://dummyjson.com/products').subscribe({
          next: (res2: any) => {
            const arr: any[] = Array.isArray(res2) ? res2 : (res2?.products ?? []);
            this.apiItems = arr.map((item: any, idx: number): Product => ({
              id: item.id ?? `api2-${idx}`,
              title: item.title ?? item.name ?? '',
              name: item.title ?? item.name ?? '',
              price: Number(item.price ?? 0),
              category: item.category ?? (Array.isArray(item.tags) ? item.tags[0] : 'General'),
              department: item.category,
              description: item.description ?? '',
              image: item.thumbnail ?? (Array.isArray(item.images) ? item.images[0] : ''),
              thumbnail: item.thumbnail,
              productId: item.id,
              sku: item.sku,
              source: 'api'
            }));
            this.recombine();
          },
          error: () => {
            this.apiItems = [];
            this.recombine();
          }
        });
      }
    });
  }

  private recombine(): void {
    const local = this.productService.getAll();
    this.allProducts = [...this.apiItems, ...local];
  }

  addProduct(): void {
    if (!this.name || !this.price) return;
    this.productService.add({
      name: this.name.trim(),
      price: Number(this.price),
      category: this.category?.trim(),
      description: this.description?.trim()
    });
    this.name = '';
    this.price = '';
    this.category = '';
    this.description = '';
    this.refresh();
    this.recombine();
  }

  editProduct(p: Product): void {
    this.editing = { ...p };
  }

  saveEdit(): void {
    if (this.editing) {
      const { id, name, price, category, description } = this.editing;
      this.productService.update(id, { name, price: Number(price), category, description });
      this.editing = null;
      this.refresh();
      this.recombine();
    }
  }

  deleteProduct(id: number | string): void {
    this.productService.delete(id);
    this.refresh();
    this.recombine();
  }
}
