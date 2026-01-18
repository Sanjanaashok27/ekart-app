
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

  private batchSize = 10; 
  private nextIndex = 0
  private endReached = false

  private isLoading = false
  private lastTick = 0
  private throttleMs = 120

  private apiLimit = 10
  private apiSkip = 0
  private totalFromServer = Number.POSITIVE_INFINITY
  private productIds = new Set<number | string>()
  private requestedSkips = new Set<number>()

  constructor(
  private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.fetchNextPage();
  }

  ngOnDestroy(): void {}

  private recombine(): void {
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
    this.endReached = base.length === 0 && this.apiSkip >= this.totalFromServer;
    if (base.length > 0) {
      const firstPage = base.slice(this.nextIndex, this.nextIndex + this.batchSize);
      this.visibleProducts = firstPage;
      this.nextIndex += firstPage.length;
      this.endReached = (this.nextIndex >= base.length) && (this.products.length >= this.totalFromServer);
    }
  }

  private loadMore(base: Product[]): void {
    if (this.isLoading || this.endReached) return;
    const nextChunk = base.slice(this.nextIndex, this.nextIndex + this.batchSize);
    if (nextChunk.length > 0) {
      this.visibleProducts = [...this.visibleProducts, ...nextChunk];
      this.nextIndex += nextChunk.length;
      this.endReached = this.nextIndex >= base.length && (this.products.length >= this.totalFromServer);
      return;
    }
    if (this.products.length < this.totalFromServer) {
      this.fetchNextPage();
    } else {
      this.endReached = true;
    }
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

  private fetchNextPage(): void {
    if (this.isLoading) return;
    if (this.products.length >= this.totalFromServer) {
      this.endReached = true;
      return;
    }
    if (typeof this.totalFromServer === 'number' && this.apiSkip >= this.totalFromServer) {
      this.endReached = true;
      return;
    }
    if (this.requestedSkips.has(this.apiSkip)) return;
    this.requestedSkips.add(this.apiSkip);
    this.isLoading = true;
    const url = `https://dummyjson.com/products?limit=${this.apiLimit}&skip=${this.apiSkip}`;
    this.http.get<any>(url).subscribe({
      next: (res) => {
        const items = (res?.products ?? []);
        this.totalFromServer = typeof res?.total === 'number' ? res.total : this.totalFromServer;
        if (!Array.isArray(items) || items.length === 0) {
          this.totalFromServer = Math.min(this.totalFromServer, this.products.length);
          this.isLoading = false;
          this.endReached = true;
          return;
        }
        const mapped: Product[] = items.map((item: any) => ({
          id: item.id,
          title: item.title ?? item.name ?? '',
          name: item.title ?? item.name ?? '',
          price: Number(item.price ?? 0),
          category: item.category ?? item.department ?? '',
          department: item.department ?? item.category ?? '',
          description: item.description ?? '',
          image: (Array.isArray(item.images) && item.images.length > 0) ? item.images[0] : (item.thumbnail ?? ''),
          thumbnail: item.thumbnail ?? (Array.isArray(item.images) && item.images[0]) ?? '',
          productId: item.id ?? '',
          sku: item.sku ?? '',
          source: 'api'
        }));
        const prevLength = this.products.length;
        const newMapped = mapped.filter(m => !this.productIds.has(m.id));
        newMapped.forEach(m => this.productIds.add(m.id));
        this.products = [...this.products, ...newMapped];
        this.filteredProducts = [...this.products];
        this.categories = this.getDistinctCategories(this.products);
        if (this.visibleProducts.length === 0) {
          this.resetInfinite();
        } else {
          const base = this.applyFilters(this.filteredProducts, this.selectedCategory, this.sortDir);
          const newlyAvailable = base.slice(prevLength, base.length);
          if (newlyAvailable.length > 0) {
            const toAppend = newlyAvailable.slice(0, this.batchSize);
            this.visibleProducts = [...this.visibleProducts, ...toAppend];
            const seen = new Set<number | string>();
            this.visibleProducts = this.visibleProducts.filter(i => {
              const exists = seen.has(i.id);
              seen.add(i.id);
              return !exists;
            });
            this.nextIndex += toAppend.length;
          }
        }
        this.apiSkip += this.apiLimit;
        if (this.apiSkip > this.totalFromServer) this.apiSkip = this.totalFromServer;
        this.isLoading = false;
        const base = this.applyFilters(this.filteredProducts, this.selectedCategory, this.sortDir);
        if (this.products.length >= this.totalFromServer) {
          this.endReached = (this.nextIndex >= base.length);
        }
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  trackById(index: number, item: Product) { return item.id ?? index; }
}
