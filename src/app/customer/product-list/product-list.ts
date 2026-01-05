
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-list.html',
  styleUrls: ['./product-list.css']
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

  private apiItems: Product[] = [];

  constructor(
    private http: HttpClient,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.loadApi();
    this.productService.products$.subscribe(() => this.recombine());
  }

  private loadApi(): void {
    this.http.get<any[]>('https://api.mydummyapi.com/categories/products').subscribe({
      next: (res) => {
        this.apiItems = (res ?? []).map((item, idx): Product => ({
          id: item.id ?? `api-${idx}`,
          title: item.title,
          name: item.name,
          price: Number(item.price ?? 0),
          category: item.category,
          department: item.department,
          description: item.description,
          image: item.image,
          thumbnail: item.thumbnail,
          productId: item.productId,
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

  private recombine(): void {
    const localItems = this.productService.getAll(); // returns Product[]
    this.products = [...this.apiItems, ...localItems];

    this.filteredProducts = [...this.products];
    this.categories = this.getDistinctCategories(this.products);

    this.currentPage = 1;
    this.updatePagedData();
  }

  onSearch(): void {
    const q = this.searchText.toLowerCase().trim();
    this.filteredProducts = this.products.filter(p =>
      (p.title ?? p.name ?? '').toLowerCase().includes(q) ||
      (p.category ?? p.department ?? '').toLowerCase().includes(q) ||
      (p.description ?? '').toLowerCase().includes(q)
    );
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
    return Math.ceil(base.length / this.itemsPerPage) || 1;
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
}
