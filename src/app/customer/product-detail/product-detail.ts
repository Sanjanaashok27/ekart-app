import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-detail.html',
  styleUrls: ['./product-detail.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  product: any = null;
  error: string | null = null;
  isAdding: boolean = false; // Tracks button loading state
  addedSuccessfully: boolean = false; // Tracks success feedback

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'Invalid product id';
      this.cdr.markForCheck();
      return;
    }

    this.http.get<any>(`https://api.mydummyapi.com/categories/products/${id}`).subscribe({
      next: (res) => {
        this.product = res;
        this.error = null;
        this.cdr.markForCheck();
      },
      error: () => {
        this.error = 'Failed to load product details';
        this.cdr.markForCheck();
      }
    });
  }

  addToCart(product: any): void {
    if (!product || this.isAdding) return;

    this.isAdding = true;
    this.cdr.markForCheck();

    setTimeout(() => {
      console.log('Product added to cart:', product);
      
      this.isAdding = false;
      this.addedSuccessfully = true;
      this.cdr.markForCheck();

      setTimeout(() => {
        this.addedSuccessfully = false;
        this.cdr.markForCheck();
      }, 2000);
    }, 600);
  }

  formatKey(key: any): string {
    const keyStr = String(key);
    return keyStr.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim().replace(/^\w/, (c) => c.toUpperCase());
  }

  isArray(val: any): boolean { return Array.isArray(val); }
  isObject(val: any): boolean { return val !== null && typeof val === 'object' && !Array.isArray(val); }
  titleOf(p: any): string { return p?.title || p?.name || 'Product'; }
  categoryOf(p: any): string { return p?.category || p?.department || 'General'; }
  priceOf(p: any): number | string { return p?.price ?? ''; }
  imageSrc(p: any): string { return p?.image || p?.thumbnail || ''; }
  hasImage(p: any): boolean { return !!(p?.image || p?.thumbnail); }
}