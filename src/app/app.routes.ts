import { Routes } from '@angular/router';
// import { Admin } from './admin/admin';
// import { Customer } from './customer/customer';

export const routes: Routes = [
    {path: '', redirectTo: 'login', pathMatch: 'full' },
    {path: 'login', loadComponent: () => import('./login/login').then(m => m.Login) },
 
  {path:'admin', loadComponent: () => import('./admin/admin').then(m => m.Admin) },
{path:'customer', loadComponent: () => import('./customer/customer').then(m => m.Customer) },
{path: 'products', loadComponent: () => import('./customer/product-list/product-list').then(m => m.ProductList) }

];
