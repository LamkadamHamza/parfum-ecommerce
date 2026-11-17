import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { CatalogApi, load } from '../catalog/catalog-api';
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
      <h2 class="section-title">Les parfums de la maison</h2>
      @if (featured(); as result) {
        @switch (result.status) {
          @case ('loading') { <p class="mt-6 muted" role="status">Chargement des parfums…</p> }
          @case ('error') { <p class="mt-6 muted" role="alert">Les parfums sont momentanément indisponibles.</p> }
          @case ('ready') {
            @if (result.data.content.length === 0) {
              <p class="mt-6 muted">Aucun parfum publié pour le moment.</p>
            } @else {
              <div class="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                @for (product of result.data.content; track product.slug) {
                  <app-product-card [product]="product" />
                }
              </div>
            }
          }
        }
      }
    </section>
  `,
})
export class HomePage {
  protected readonly featured = toSignal(load(inject(CatalogApi).products({ size: 3 })));
}
