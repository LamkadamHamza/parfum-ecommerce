import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <section class="shell page">
      <h1>Administration</h1>
      <p class="muted mt-3">Aperçu de démonstration de l’espace de gestion.</p>
      <div class="mt-8 grid gap-6 md:grid-cols-[13rem_1fr]">
        <nav aria-label="Administration" class="panel flex flex-wrap content-start gap-4 md:flex-col">
          <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Vue d’ensemble</a>
          <a routerLink="/admin/catalogue" routerLinkActive="active">Catalogue</a>
          <a routerLink="/admin/commandes" routerLinkActive="active">Commandes</a>
        </nav>
        <div class="panel"><router-outlet /></div>
      </div>
    </section>
  `,
})
export class AdminLayout {}

@Component({
  template: `<h2 class="text-3xl">{{ title() }}</h2><p class="muted mt-3">Aucune donnée de gestion disponible.</p>`,
})
export class AdminSection {
  readonly title = input.required<string>();
}
