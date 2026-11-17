import { TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';

describe('Navigation de la boutique', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes, withComponentInputBinding())] });
  });

  it('affiche les parfums fictifs dans le catalogue', async () => {
    const harness = await RouterTestingHarness.create('/catalogue');
    expect(harness.routeNativeElement?.textContent).toContain('Données de démonstration');
    expect(harness.routeNativeElement?.querySelectorAll('app-product-card').length).toBe(3);
  });

  it('ouvre une fiche produit à partir du slug', async () => {
    const harness = await RouterTestingHarness.create('/catalogue/ambre-nocturne');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Ambre Nocturne');
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

  it('affiche un état introuvable pour un slug inconnu', async () => {
    const harness = await RouterTestingHarness.create('/catalogue/inconnu');
    expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toBe('Parfum introuvable');
  });
});
