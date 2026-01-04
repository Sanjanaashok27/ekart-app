
import { HttpClient } from '@angular/common/http';
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryFilterPipe } from '../../pipes/category-filter.pipe';
import { PriceSortPipe } from '../../pipes/price-sort.pipe';

interface Product {
  id?: string | number;
  title?: string;
  name?: string;
  category?: string;
  department?: string;
  price?: number | string;
  image?: string;
  thumbnail?: string;
  description?: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, CategoryFilterPipe, PriceSortPipe],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductList implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  pagedProducts: Product[] = [];

  searchText = '';
  selectedCategory = 'all';
  sortDir: 'asc' | 'desc' = 'asc';

  categories: string[] = [];

  currentPage = 1;
  itemsPerPage = 8;

  isLoading = false;
  errorMessage = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.http.get<Product[]>('https://api.mydummyapi.com/categories/products').subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : [];
        this.products = list.map(p => this.normalizeProduct(p));
        this.filteredProducts = [...this.products];
        this.categories = this.getDistinctCategories(this.products);
        this.currentPage = 1;
        this.updatePagedData();
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to load products. Please try again.';
        console.error('ProductList error', err);
        this.cdr.markForCheck();
      }
    });
  }

  onSearch(): void {
    const text = (this.searchText || '').toLowerCase().trim();

    this.filteredProducts = this.products.filter(product => {
      const title = (product.title || product.name || '').toLowerCase();
      const cat = (product.category || product.department || '').toLowerCase();
      return title.includes(text) || cat.includes(text);
    });

    this.currentPage = 1;
    this.updatePagedData();
  }

  onCategoryChange(): void {
    this.currentPage = 1;
    this.updatePagedData();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.updatePagedData();
  }

  updatePagedData(): void {
    const base = this.applyFilters(this.filteredProducts, this.selectedCategory, this.sortDir);
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    this.pagedProducts = base.slice(start, end);
    this.cdr.markForCheck();
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagedData();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagedData();
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagedData();
    }
  }

  get totalPages(): number {
    const base = this.applyFilters(this.filteredProducts, this.selectedCategory, this.sortDir);
    return Math.max(1, Math.ceil(base.length / this.itemsPerPage));
  }

  private applyFilters(items: Product[], category: string, dir: 'asc' | 'desc'): Product[] {
    let out = items;

    if (category && category !== 'all') {
      const match = category.toLowerCase();
      out = out.filter(p => (p.category || p.department || '').toLowerCase() === match);
    }

    const copy = [...out];
    copy.sort((a, b) => {
      const pa = this.safeNumber(a.price);
      const pb = this.safeNumber(b.price);
      return dir === 'asc' ? pa - pb : pb - pa;
    });

    return copy;
  }

  private getDistinctCategories(items: Product[]): string[] {
    const set = new Set<string>();

    items.forEach(p => {
      const cat = (p.category || p.department || '').toString().trim();
      if (cat) set.add(cat);
    });

    const sorted = Array.from(set).sort((a, b) => a.localeCompare(b));
    return ['all', ...sorted];
  }

  private normalizeProduct(p: Product): Product {
    return {
      id: p.id ?? (p as any).productId ?? (p.title || p.name),
      title: p.title ?? p.name ?? '',
      name: p.name ?? p.title ?? '',
      category: p.category ?? p.department ?? '',
      department: p.department ?? p.category ?? '',
      price: this.safeNumber(p.price),
      image: p.image ?? p.thumbnail ?? '',
      thumbnail: p.thumbnail ?? p.image ?? '',
      description: p.description ?? ''
    };
  }

  private safeNumber(v: number | string | undefined): number {
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    if (typeof v === 'string') {
      const n = Number(v);
      return isFinite(n) ? n : 0;
    }
    return 0;
  }
}
