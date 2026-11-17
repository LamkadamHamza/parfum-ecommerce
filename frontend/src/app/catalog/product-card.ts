import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductSummary } from './catalog-api';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, CurrencyPipe],
  template: `
    <a [routerLink]="['/catalogue', product().slug]" class="product-card">
      <div class="product-art" aria-hidden="true">
        <div class="bottle"><span>Maison Ambrée</span></div>
      </div>
      <p class="muted mt-4">{{ product().brand.name }} · {{ product().category.name }}</p>
      <h2 class="mt-1 text-2xl">{{ product().name }}</h2>
      @if (product().startingPrice; as price) {
        <p class="mt-1">À partir de {{ price.amount | currency:price.currency:'symbol':'1.2-2':'fr' }}</p>
      }
    </a>
  `,
})
export class ProductCard {
  readonly product = input.required<ProductSummary>();
}
