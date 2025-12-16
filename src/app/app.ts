import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ApplicationConfig} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('ekart');
}
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient()
  ]
};