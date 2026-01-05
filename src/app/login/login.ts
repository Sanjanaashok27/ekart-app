
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // <-- ensure this path
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  username = '';
  password = '';
  error = signal<string>('');

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    const user = this.auth.login(this.username.trim(), this.password);

    if (!user) {
      this.error.set('Invalid username or password');
      return;
    }

    // Redirect: admin -> /admin, customer -> /products (public)
    this.router.navigateByUrl(user.role === 'admin' ? '/admin' : '/products');
  }
}
