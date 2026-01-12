
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
})
export class ProductList implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  visibleProducts: Product[] = [];

  searchText = '';
  selectedCategory = 'all';
  sortDir: 'asc' | 'desc' = 'asc';
  categories: string[] = [];

  private localItems: Product[] = [];
  private batchSize = 16;

  private nextIndex = 0;
  private endReached = false;

  private isLoading = false;
  private lastTick = 0;
  private throttleMs = 120;

  constructor(
    private http: HttpClient,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.http.get<any[]>('/products.json').subscribe({
      next: (res) => {
        this.localItems = (res ?? []).map((item, idx): Product => ({
          id: item.id ?? `local-${idx}`,
          title: item.title ?? item.name ?? '',
          name: item.name ?? item.title ?? '',
          price: Number(item.price ?? 0),
          category: item.category ?? item.department ?? '',
          department: item.department ?? item.category ?? '',
          description: item.description ?? '',
          image: item.image ?? item.thumbnail ?? '',
          thumbnail: item.thumbnail ?? item.image ?? '',
          productId: item.productId ?? '',
          sku: item.sku ?? '',
          source: 'local'
        }));
        this.recombine();
      },
      error: () => {
        this.localItems = [];
        this.recombine();
      }
    });

    this.productService.products$.subscribe(() => this.recombine());
  }

  ngOnDestroy(): void {}

  private recombine(): void {
    const serviceItems = this.productService.getAll();
    this.products = [...this.localItems, ...serviceItems];
    this.filteredProducts = [...this.products];
    this.categories = this.getDistinctCategories(this.products);
    this.resetInfinite();
  }

  onSearch(): void {
    const q = this.searchText.toLowerCase().trim();
    this.filteredProducts = this.products.filter(p =>
      (p.title ?? p.name ?? '').toLowerCase().includes(q) ||
      (p.category ?? p.department ?? '').toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q)
    );
    this.resetInfinite();
  }

  onCategoryChange(): void {
    this.resetInfinite();
  }

  onSortChange(): void {
    this.resetInfinite();
  }

  private applyFilters(items: Product[], category: string, dir: 'asc' | 'desc'): Product[] {
    let out = items;
    if (category && category !== 'all') {
      out = out.filter(p => (p.category ?? p.department ?? '').toLowerCase() === category.toLowerCase());
    }
    const copy = [...out];
    copy.sort((a, b) => {
      const pa = Number(a.price) || 0;
      const pb = Number(b.price) || 0;
      return dir === 'asc' ? pa - pb : pb - pa;
    });
    return copy;
  }

  private getDistinctCategories(items: Product[]): string[] {
    const set = new Set<string>();
    items.forEach(p => {
      const c = (p.category ?? p.department ?? '').toString().trim();
      if (c) set.add(c);
    });
    return ['all', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }

  private resetInfinite(): void {
    const base = this.applyFilters(this.filteredProducts, this.selectedCategory, this.sortDir);
    this.visibleProducts = [];
    this.nextIndex = 0;
    this.endReached = base.length === 0;

    if (!this.endReached) {
      const firstPage = base.slice(this.nextIndex, this.nextIndex + this.batchSize);
      this.visibleProducts = firstPage;
      this.nextIndex += firstPage.length;
      this.endReached = this.nextIndex >= base.length;
    }
  }

  private loadMore(base: Product[]): void {
    if (this.isLoading || this.endReached) return;
    if (base.length === 0) return;

    this.isLoading = true;
    const nextChunk = base.slice(this.nextIndex, this.nextIndex + this.batchSize);
    if (nextChunk.length > 0) {
      this.visibleProducts = [...this.visibleProducts, ...nextChunk];
      this.nextIndex += nextChunk.length;
      this.endReached = this.nextIndex >= base.length;
    } else {
      this.endReached = true;
    }
    this.isLoading = false;
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const now = Date.now();
    if (now - this.lastTick < this.throttleMs) return;
    this.lastTick = now;

    const scrollPos = window.scrollY + window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;
    const nearBottom = docHeight - scrollPos < 600;

    if (nearBottom) {
      const base = this.applyFilters(this.filteredProducts, this.selectedCategory, this.sortDir);
      this.loadMore(base);
    }
  }

  trackById(index: number, item: Product) { return item.id ?? index; }
}
