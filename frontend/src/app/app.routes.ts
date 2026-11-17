import { Routes } from '@angular/router';
import { AdminLayout, AdminSection } from './admin/admin-layout';
import { CatalogPage, ProductPage } from './catalog/catalog-pages';
import { HomePage } from './storefront/home';
import { CartPage, CheckoutPage, NotFoundPage } from './storefront/purchase-pages';

export const routes: Routes = [
  { path: '', component: HomePage, title: 'Maison Ambrée' },
  { path: 'catalogue', component: CatalogPage, title: 'Catalogue · Maison Ambrée' },
  { path: 'catalogue/:slug', component: ProductPage, title: 'Parfum · Maison Ambrée' },
  { path: 'panier', component: CartPage, title: 'Panier · Maison Ambrée' },
  { path: 'checkout', component: CheckoutPage, title: 'Commande · Maison Ambrée' },
  {
    path: 'admin', component: AdminLayout, title: 'Administration · Maison Ambrée',
    children: [
      { path: '', component: AdminSection, data: { title: 'Vue d’ensemble' } },
      { path: 'catalogue', component: AdminSection, data: { title: 'Catalogue' } },
      { path: 'commandes', component: AdminSection, data: { title: 'Commandes' } },
    ],
  },
  { path: '**', component: NotFoundPage, title: 'Page introuvable · Maison Ambrée' },
];
