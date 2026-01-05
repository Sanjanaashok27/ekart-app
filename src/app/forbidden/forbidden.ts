
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section style="max-width: 560px; margin: 64px auto; text-align:center;">
      <h1 style="margin-bottom: 12px;">Access denied</h1>
      <p style="margin-bottom: 24px; color:#666;">
        You’re not authorized to view this page.
      </p>
      <a routerLink="/landing" style="margin-right: 12px;">Go to Home</a>
      <a routerLink="/login">Sign in</a>
    </section>
  `
})
export class Forbidden {}
