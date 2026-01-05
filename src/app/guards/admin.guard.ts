
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Allow only if logged in and role = admin
  if (!auth.isLoggedIn() || !auth.isAdmin()) {
    router.navigate(['/forbidden']); // 403 page
    return false;
  }
  return true;
};
