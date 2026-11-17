import { CurrencyPipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BehaviorSubject, forkJoin, switchMap } from 'rxjs';
import { CatalogApi, CatalogSort, load, ProductQuery } from './catalog-api';
import { ProductCard } from './product-card';

@Component({
  imports: [ProductCard, ReactiveFormsModule],
  template: `
    <section class="shell page">
      <h1>Le catalogue</h1>

      <form class="catalog-filters mt-8 grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_auto]"
            [formGroup]="filters" (ngSubmit)="applyFilters()">
        <label class="grid gap-1">
          <span>Nom du parfum</span>
          <input type="search" formControlName="search" maxlength="160" placeholder="Rechercher un parfum">
        </label>
        <label class="grid gap-1">
          <span>Catégorie</span>
          <select formControlName="category">
            <option value="">Toutes</option>
            @if (facets(); as options) {
              @if (options.status === 'ready') {
                @for (category of options.data.categories; track category.slug) {
                  <option [value]="category.slug">{{ category.name }}</option>
                }
              }
            }
          </select>
        </label>
        <label class="grid gap-1">
          <span>Marque</span>
          <select formControlName="brand">
            <option value="">Toutes</option>
            @if (facets(); as options) {
              @if (options.status === 'ready') {
                @for (brand of options.data.brands; track brand.slug) {
                  <option [value]="brand.slug">{{ brand.name }}</option>
                }
              }
            }
          </select>
        </label>
        <label class="grid gap-1">
          <span>Trier par</span>
          <select formControlName="sort">
            <option value="name,asc">Nom (A à Z)</option>
            <option value="name,desc">Nom (Z à A)</option>
            <option value="price,asc">Prix croissant</option>
            <option value="price,desc">Prix décroissant</option>
          </select>
        </label>
        <button class="button justify-center" type="submit">Rechercher</button>
      </form>

      @if (facets()?.status === 'error') {
        <p class="mt-3 muted" role="alert">Les catégories et les marques sont momentanément indisponibles.</p>
      }
      @if (results(); as result) {
        @switch (result.status) {
          @case ('loading') {
            <p class="mt-8 muted" role="status">Chargement des parfums…</p>
          }
          @case ('error') {
            <p class="mt-8" role="alert">Le catalogue est momentanément indisponible.</p>
            <button class="text-link mt-3" type="button" (click)="retry()">Réessayer</button>
          }
          @case ('ready') {
            @if (result.data.content.length === 0) {
              <p class="mt-8 muted" role="status">Aucun parfum ne correspond à votre recherche.</p>
            } @else {
              <p class="mt-6 muted" role="status">{{ result.data.totalElements }} parfum(s)</p>
              <div class="mt-4 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                @for (product of result.data.content; track product.slug) {
                  <app-product-card [product]="product" />
                }
              </div>
            }
            @if (result.data.totalPages > 1) {
              <nav class="mt-10 flex flex-wrap items-center gap-4" aria-label="Pagination du catalogue">
                <button type="button" class="button" [disabled]="result.data.page === 0"
                        (click)="goToPage(result.data.page - 1)">Précédente</button>
                <span>Page {{ result.data.page + 1 }} sur {{ result.data.totalPages }}</span>
                <button type="button" class="button" [disabled]="result.data.page + 1 >= result.data.totalPages"
                        (click)="goToPage(result.data.page + 1)">Suivante</button>
              </nav>
            }
          }
        }
      }
    </section>
  `,
})
export class CatalogPage {
  private readonly api = inject(CatalogApi);
  private readonly query = new BehaviorSubject<ProductQuery>({ page: 0, size: 12 });
  private readonly facetRefresh = new BehaviorSubject<void>(undefined);

  protected readonly filters = inject(FormBuilder).nonNullable.group({
    search: '',
    category: '',
    brand: '',
    sort: 'name,asc' as CatalogSort,
  });

  protected readonly results = toSignal(this.query.pipe(switchMap(query => load(this.api.products(query)))));
  protected readonly facets = toSignal(this.facetRefresh.pipe(switchMap(() => load(forkJoin({
    categories: this.api.categories(),
    brands: this.api.brands(),
  })))));

  protected applyFilters(): void {
    const filters = this.filters.getRawValue();
    this.query.next({ ...this.query.value, ...filters, search: filters.search.trim(), page: 0 });
  }

  protected goToPage(page: number): void {
    this.query.next({ ...this.query.value, page });
  }

  protected retry(): void {
    this.query.next(this.query.value);
    if (this.facets()?.status === 'error') {
      this.facetRefresh.next();
    }
  }
}

@Component({
  imports: [RouterLink, CurrencyPipe],
  template: `
    <section class="shell page">
      <a class="text-link" routerLink="/catalogue">← Catalogue</a>
      @if (product(); as result) {
        @switch (result.status) {
          @case ('loading') {
            <p class="mt-8 muted" role="status">Chargement du parfum…</p>
          }
          @case ('error') {
            @if (result.notFound) {
              <h1 class="mt-8">Parfum introuvable</h1>
            } @else {
              <h1 class="mt-8">Parfum indisponible</h1>
              <p class="mt-4 muted" role="alert">Impossible de charger cette fiche pour le moment.</p>
            }
          }
          @case ('ready') {
            <div class="mt-8 grid items-start gap-10 md:grid-cols-2">
              <div class="product-art" aria-hidden="true">
                <div class="bottle"><span>Maison Ambrée</span></div>
              </div>
              <div>
                <p class="eyebrow">{{ result.data.brand.name }} · {{ result.data.category.name }}</p>
                <h1>{{ result.data.name }}</h1>
                <p class="muted mt-4">{{ result.data.description }}</p>
                <h2 class="mt-8 text-2xl">Contenances</h2>
                @if (result.data.variants.length === 0) {
                  <p class="mt-3 muted">Aucune contenance proposée.</p>
                } @else {
                  <ul class="mt-3 grid gap-2">
                    @for (variant of result.data.variants; track variant.sku) {
                      <li class="panel flex flex-wrap justify-between gap-2">
                        <span>{{ variant.volumeMl }} ml</span>
                        <span>{{ variant.price.amount | currency:variant.price.currency:'symbol':'1.2-2':'fr' }}</span>
                        <span class="muted">
                          @if (variant.availableQuantity > 0) {
                            {{ variant.availableQuantity }} en stock
                          } @else {
                            Rupture de stock
                          }
                        </span>
                      </li>
                    }
                  </ul>
                }
              </div>
            </div>
          }
        }
      }
    </section>
  `,
})
export class ProductPage {
  readonly slug = input.required<string>();
  private readonly api = inject(CatalogApi);
  protected readonly product = toSignal(toObservable(this.slug).pipe(switchMap(slug => load(this.api.product(slug)))));
}
