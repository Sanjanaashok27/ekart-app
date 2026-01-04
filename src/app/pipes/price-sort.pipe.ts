import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'priceSort', standalone: true })
export class PriceSortPipe implements PipeTransform {
  transform(items: any[], direction: 'asc' | 'desc' = 'asc'): any[] {
    if (!items || !direction) return items;
    const copy = [...items];
    return copy.sort((a, b) => {
      const pa = Number(a.price) || 0;
      const pb = Number(b.price) || 0;
      return direction === 'asc' ? pa - pb : pb - pa;
    });
  }
}
