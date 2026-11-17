import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, of, startWith } from 'rxjs';

export interface Taxon {
  slug: string;
  name: string;
}

export interface Money {
  amount: number;
  currency: string;
}

export interface ProductSummary {
  slug: string;
  name: string;
  brand: Taxon;
  category: Taxon;
  startingPrice: Money | null;
}

export interface ProductVariant {
  sku: string;
  volumeMl: number;
  price: Money;
  availableQuantity: number;
}

export interface ProductDetail extends Omit<ProductSummary, 'startingPrice'> {
  description: string;
  variants: ProductVariant[];
}

export interface ProductPageResponse {
  content: ProductSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type CatalogSort = 'name,asc' | 'name,desc' | 'price,asc' | 'price,desc';

export interface ProductQuery {
  page?: number;
  size?: number;
  search?: string;
  category?: string;
  brand?: string;
  sort?: CatalogSort;
}

@Injectable({ providedIn: 'root' })
export class CatalogApi {
  private readonly http = inject(HttpClient);

  products(query: ProductQuery = {}): Observable<ProductPageResponse> {
    let params = new HttpParams();
    for (const [name, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        params = params.set(name, value);
      }
    }
    return this.http.get<ProductPageResponse>('/api/products', { params });
  }

  product(slug: string): Observable<ProductDetail> {
    return this.http.get<ProductDetail>(`/api/products/${encodeURIComponent(slug)}`);
  }

  categories(): Observable<Taxon[]> {
    return this.http.get<Taxon[]>('/api/categories');
  }

  brands(): Observable<Taxon[]> {
    return this.http.get<Taxon[]>('/api/brands');
  }
}

export type LoadState<T> =
  | { status: 'loading' }
  | { status: 'ready'; data: T }
  | { status: 'error'; notFound: boolean };

export function load<T>(request: Observable<T>): Observable<LoadState<T>> {
  return request.pipe(
    map((data): LoadState<T> => ({ status: 'ready', data })),
    catchError((error: unknown) =>
      of<LoadState<T>>({
        status: 'error',
        notFound: error instanceof HttpErrorResponse && error.status === 404,
      }),
    ),
    startWith<LoadState<T>>({ status: 'loading' }),
  );
}
