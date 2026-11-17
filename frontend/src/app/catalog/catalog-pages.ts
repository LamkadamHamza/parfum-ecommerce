import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEMO_PRODUCTS } from './demo-products';
import { ProductCard } from './product-card';

@Component({
  imports: [ProductCard],
  template: `
    <section class="shell page">
      <p class="eyebrow">Données de démonstration</p>
      <h1>Le catalogue</h1>
      <div class="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        @for (product of products; track product.slug) {
          <app-product-card [product]="product" />
        }
      </div>
    </section>
  `,
})
export class CatalogPage {
  protected readonly products = DEMO_PRODUCTS;
}

@Component({
  imports: [RouterLink],
  template: `
    <section class="shell page">
      <a class="text-link" routerLink="/catalogue">← Catalogue</a>
      @if (product(); as item) {
        <div class="mt-8 grid items-center gap-10 md:grid-cols-2">
          <div class="product-art" [attr.data-tone]="item.tone" aria-hidden="true">
            <div class="bottle"><span>Maison Ambrée</span></div>
          </div>
          <div>
            <p class="eyebrow">Parfum fictif · Démonstration</p>
            <h1>{{ item.name }}</h1>
            <p class="mt-4 font-semibold">{{ item.notes }}</p>
            <p class="muted mt-3">{{ item.description }}</p>
            <p class="mt-6 text-xl">{{ item.volume }} ml · {{ item.price }} €</p>
          </div>
        </div>
      } @else {
        <h1 class="mt-8">Parfum introuvable</h1>
      }
    </section>
  `,
})
export class ProductPage {
  readonly slug = input.required<string>();
  protected readonly product = computed(() => DEMO_PRODUCTS.find(item => item.slug === this.slug()));
}
