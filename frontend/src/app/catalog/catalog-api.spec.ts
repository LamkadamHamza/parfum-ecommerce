import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CatalogApi } from './catalog-api';

describe('CatalogApi', () => {
  let api: CatalogApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(CatalogApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('encode les paramètres, conserve la page zéro et omet les filtres vides', () => {
    api.products({ page: 0, search: 'Ambre & Iris', category: '', sort: 'price,asc' }).subscribe();
    const request = http.expectOne(req => req.url === '/api/products');
    expect(request.request.method).toBe('GET');
    expect(request.request.urlWithParams).toContain('search=Ambre%20%26%20Iris');
    expect(request.request.params.get('page')).toBe('0');
    expect(request.request.params.has('category')).toBe(false);
    expect(request.request.params.get('sort')).toBe('price,asc');
    request.flush({ content: [], page: 0, size: 12, totalElements: 0, totalPages: 0 });
  });

  it('encode le slug comme segment d’URL', () => {
    api.product('iris de minuit').subscribe();
    http.expectOne('/api/products/iris%20de%20minuit').flush({});
  });
});
