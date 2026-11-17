import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEMO_PRODUCTS } from '../catalog/demo-products';
import { ProductCard } from '../catalog/product-card';

@Component({
  imports: [RouterLink, ProductCard],
  template: `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">Parfumerie de caractère</p>
        <h1>Le parfum,<br><em>à fleur de peau.</em></h1>
        <p class="hero-description">Des compositions intimes, entre bois précieux, fleurs poudrées et résines ambrées.</p>
        <a class="button" routerLink="/catalogue">Découvrir les parfums <span aria-hidden="true">↗</span></a>
      </div>
      <div class="hero-image" role="img" aria-label="Flacon de parfum ambré sur un socle d’ardoise"></div>
    </section>
    <section class="shell py-14 sm:py-20">
      <p class="eyebrow">Données de démonstration</p>
      <h2 class="section-title">Les parfums de la maison</h2>
      <div class="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        @for (product of products; track product.slug) {
          <app-product-card [product]="product" />
        }
      </div>
    </section>
  `,
})
export class HomePage {
  protected readonly products = DEMO_PRODUCTS;
}
