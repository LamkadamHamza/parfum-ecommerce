import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoProduct } from './demo-products';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  template: `
    <a [routerLink]="['/catalogue', product().slug]" class="product-card">
      <div class="product-art" [attr.data-tone]="product().tone" aria-hidden="true">
        <div class="bottle"><span>Maison Ambrée</span></div>
      </div>
      <div class="mt-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 class="text-2xl">{{ product().name }}</h2>
        <span>{{ product().price }} €</span>
      </div>
      <p class="muted mt-1">{{ product().notes }}</p>
    </a>
  `,
})
export class ProductCard {
  readonly product = input.required<DemoProduct>();
}
