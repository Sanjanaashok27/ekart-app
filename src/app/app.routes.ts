
import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'landing', pathMatch: 'full' },


  { path: 'landing', loadComponent: () => import('./landing/landing').then(m => m.Landing) },
  { path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
  { path: 'product-list', loadComponent: () => import('./customer/customer').then(m => m.Customer) },

  
  { path: 'products', loadComponent: () => import('./customer/product-list/product-list').then(m => m.ProductList) },
  { path: 'product/:id', loadComponent: () => import('./customer/product-detail/product-detail').then(m => m.ProductDetail) },

  
  { path: 'admin', canActivate: [adminGuard], loadComponent: () => import('./admin/admin').then(m => m.Admin) },

  
  { path: 'forbidden', loadComponent: () => import('./forbidden/forbidden').then(m => m.Forbidden) },

 
  { path: '**', redirectTo: 'landing' }
];

