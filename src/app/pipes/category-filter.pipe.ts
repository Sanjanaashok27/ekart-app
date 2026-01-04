import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'categoryFilter', standalone: true })
export class CategoryFilterPipe implements PipeTransform {
  transform(items: any[], category: string): any[] {
    if (!items || !category || category === 'all') return items;
    return items.filter(p => (p.category || p.department || '').toLowerCase() === category.toLowerCase());
  }
}
