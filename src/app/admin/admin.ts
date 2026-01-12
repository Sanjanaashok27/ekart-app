
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
  filteredProducts: Product[] = [];
  allProducts: Product[] = [];
  private apiItems: Product[] = [];

  showAddModal = false;
  showEditModal = false;

  addForm = { name: '', price: null as number | null, category: '', description: '', image: '' as string };
  editing: Product | null = null;

  searchText = '';
  private lastSearchTs = 0;
  private debounceMs = 150;

  constructor(private productService: ProductService, private http: HttpClient) {}

  ngOnInit(): void {
    this.refresh();
    this.loadApi();
    this.productService.products$.subscribe(() => {
      this.refresh();
      this.recombine();
    });
  }

  openAdd(): void {
    this.addForm = { name: '', price: null, category: '', description: '', image: '' };
    this.showAddModal = true;
  }

  closeAdd(): void {
    this.showAddModal = false;
  }

  onImageSelected(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { this.addForm.image = reader.result as string; };
    reader.readAsDataURL(file);
  }

  saveAdd(): void {
    if (!this.addForm.name || this.addForm.price === null) return;
    this.productService.add({
      name: this.addForm.name.trim(),
      price: Number(this.addForm.price),
      category: this.addForm.category?.trim(),
      description: this.addForm.description?.trim(),
      image: this.addForm.image
    });
    this.closeAdd();
    this.refresh();
    this.recombine();
  }

  openEdit(p: Product): void {
    this.editing = { ...p };
    this.showEditModal = true;
  }

  closeEdit(): void {
    this.showEditModal = false;
    this.editing = null;
  }

  onEditImageSelected(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !this.editing) return;
    const reader = new FileReader();
    reader.onload = () => { if (this.editing) this.editing.image = reader.result as string; };
    reader.readAsDataURL(file);
  }

  saveEdit(): void {
    if (!this.editing) return;
    const { id, name, price, category, description, image } = this.editing;
    this.productService.update(id, { name, price: Number(price), category, description, image });
    this.closeEdit();
    this.refresh();
    this.recombine();
  }

  deleteProduct(id: number | string): void {
    this.productService.delete(id);
    alert("product deleted successfully")
    this.refresh();
    this.recombine();
  }

  refresh(): void {
    this.products = [...this.productService.getAll()].reverse();
    this.applySearch();
  }

  onSearchInput(): void {
    const now = Date.now();
    if (now - this.lastSearchTs < this.debounceMs) return;
    this.lastSearchTs = now;
    this.applySearch();
  }

  private applySearch(): void {
    const q = this.searchText.toLowerCase().trim();
    if (!q) {
      this.filteredProducts = [...this.products];
      return;
    }
    this.filteredProducts = this.products.filter(p => {
      const name = (p.name ?? p.title ?? '').toLowerCase();
      const category = (p.category ?? p.department ?? '').toLowerCase();
      const desc = (p.description ?? '').toLowerCase();
      return name.includes(q) || category.includes(q) || desc.includes(q);
    });
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
}
