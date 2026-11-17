import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  template: `
    <section class="shell page">
      <h1>Votre panier</h1>
      <p class="muted my-6">Votre panier est vide.</p>
      <a class="button" routerLink="/catalogue">Explorer le catalogue</a>
    </section>
  `,
})
export class CartPage {}

@Component({
  imports: [RouterLink],
  template: `
    <section class="shell page">
      <h1>Finaliser la commande</h1>
      <div class="my-7 grid gap-5 md:grid-cols-3">
        <section class="panel">
          <h2 class="text-2xl">Récapitulatif</h2>
          <p class="muted mt-2">Le panier est vide.</p>
        </section>
        <section class="panel">
          <h2 class="text-2xl">Livraison</h2>
          <p class="muted mt-2">Les options de livraison ne sont pas encore disponibles.</p>
        </section>
        <section class="panel">
          <h2 class="text-2xl">Paiement</h2>
          <p class="muted mt-2">Aucun paiement ne peut être effectué sur cette boutique de démonstration.</p>
        </section>
      </div>
      <a class="text-link" routerLink="/panier">Retour au panier</a>
    </section>
  `,
})
export class CheckoutPage {}

@Component({
  imports: [RouterLink],
  template: `
    <section class="shell page">
      <h1>Page introuvable</h1>
      <a class="text-link mt-6 inline-block" routerLink="/">Retour à l’accueil</a>
    </section>
  `,
})
export class NotFoundPage {}
