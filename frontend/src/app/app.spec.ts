import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { appConfig } from './app.config';
import { ProductPageResponse } from './catalog/catalog-api';

const brand = { slug: 'maison-ambree', name: 'Maison Ambrée' };
const category = { slug: 'ambres', name: 'Ambrés' };
const product = {
  slug: 'ambre-nocturne', name: 'Ambre Nocturne', brand, category,
  startingPrice: { amount: 65, currency: 'EUR' },
};
const firstPage: ProductPageResponse = { content: [product], page: 0, size: 12, totalElements: 13, totalPages: 2 };

describe('Navigation de la boutique', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [...appConfig.providers, provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  async function openCatalog() {
    const harness = await RouterTestingHarness.create('/catalogue');
    http.expectOne('/api/categories').flush([category]);
    http.expectOne('/api/brands').flush([brand]);
    return harness;
  }

  it('affiche les résultats reçus, puis charge la page suivante', async () => {
    const harness = await openCatalog();
    expect(harness.routeNativeElement?.textContent).toContain('Chargement');
    http.expectOne('/api/products?page=0&size=12').flush(firstPage);
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('app-product-card')?.textContent).toContain('Ambre Nocturne');
    (harness.routeNativeElement?.querySelector('nav button:last-child') as HTMLButtonElement).click();
    http.expectOne('/api/products?page=1&size=12').flush({ ...firstPage, page: 1 });
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Page 2 sur 2');
  });

  it('envoie la recherche, les filtres et le tri et affiche le résultat vide', async () => {
    const harness = await openCatalog();
    http.expectOne('/api/products?page=0&size=12').flush(firstPage);
    harness.detectChanges();
    const root = harness.routeNativeElement!;
    const search = root.querySelector<HTMLInputElement>('input[type=search]')!;
    search.value = '  Iris  ';
    search.dispatchEvent(new Event('input'));
    for (const [name, value] of [['category', 'ambres'], ['brand', 'maison-ambree'], ['sort', 'price,desc']]) {
      const select = root.querySelector<HTMLSelectElement>(`select[formcontrolname="${name}"]`)!;
      select.value = value;
      select.dispatchEvent(new Event('change'));
    }
    root.querySelector('form')!.dispatchEvent(new Event('submit'));
    const request = http.expectOne(req => req.url === '/api/products' && req.params.get('search') === 'Iris');
    expect(request.request.params.get('category')).toBe('ambres');
    expect(request.request.params.get('brand')).toBe('maison-ambree');
    expect(request.request.params.get('sort')).toBe('price,desc');
    expect(request.request.params.get('page')).toBe('0');
    request.flush({ ...firstPage, content: [], totalElements: 0, totalPages: 0 });
    harness.detectChanges();
    expect(root.textContent).toContain('Aucun parfum');
  });

  it('affiche une erreur catalogue et permet de relancer la requête', async () => {
    const harness = await openCatalog();
    http.expectOne('/api/products?page=0&size=12').flush({}, { status: 503, statusText: 'Unavailable' });
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('[role=alert]')?.textContent).toContain('indisponible');
    harness.routeNativeElement?.querySelector<HTMLButtonElement>('button.text-link')?.click();
    http.expectOne('/api/products?page=0&size=12').flush(firstPage);
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain('Ambre Nocturne');
  });

  it('ouvre une fiche produit par slug et affiche contenances et stock', async () => {
    const harness = await RouterTestingHarness.create('/catalogue/ambre-nocturne');
    http.expectOne('/api/products/ambre-nocturne').flush({
      ...product, description: 'Ambre et encens',
      variants: [
        { sku: 'AMB-30', volumeMl: 30, price: { amount: 65, currency: 'EUR' }, availableQuantity: 10 },
        { sku: 'AMB-50', volumeMl: 50, price: { amount: 95, currency: 'EUR' }, availableQuantity: 0 },
      ],
    });
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Ambre Nocturne');
    expect(harness.routeNativeElement?.textContent).toContain('30 ml');
    expect(harness.routeNativeElement?.textContent).toContain('10 en stock');
    expect(harness.routeNativeElement?.textContent).toContain('Rupture de stock');
  });

  it('distingue un produit inexistant d’une erreur API', async () => {
    const harness = await RouterTestingHarness.create('/catalogue/inconnu');
    http.expectOne('/api/products/inconnu').flush({}, { status: 404, statusText: 'Not Found' });
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Parfum introuvable');

    await harness.navigateByUrl('/catalogue/autre');
    http.expectOne('/api/products/autre').flush({}, { status: 500, statusText: 'Server Error' });
    harness.detectChanges();
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Parfum indisponible');
  });

  it('affiche le checkout de démonstration', async () => {
    const harness = await RouterTestingHarness.create('/checkout');
    expect(harness.routeNativeElement?.querySelectorAll('h2').length).toBe(3);
    expect(harness.routeNativeElement?.textContent).toContain('Paiement');
  });

  it('affiche la section commandes dans le layout administration', async () => {
    const harness = await RouterTestingHarness.create('/admin/commandes');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Administration');
    expect(harness.routeNativeElement?.querySelector('h2')?.textContent).toBe('Commandes');
  });
});
