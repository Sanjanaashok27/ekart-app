import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css'],
})
export class Landing {
  
constructor(private router: Router) {}
  goLogin() { this.router.navigate(['/login']); }
  goBrowse() { this.router.navigate(['/products']); }

}
