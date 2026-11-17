export interface DemoProduct {
  readonly slug: string;
  readonly name: string;
  readonly notes: string;
  readonly description: string;
  readonly price: number;
  readonly volume: number;
  readonly tone: string;
}

export const DEMO_PRODUCTS: readonly DemoProduct[] = [
  {
    slug: 'ambre-nocturne', name: 'Ambre Nocturne', notes: 'Ambre · Encens · Vanille',
    description: 'Un accord d’ambre enveloppant, traversé d’encens et adouci par une vanille sèche.',
    price: 95, volume: 50, tone: 'amber',
  },
  {
    slug: 'iris-de-minuit', name: 'Iris de Minuit', notes: 'Iris · Violette · Cèdre',
    description: 'Un iris poudré et frais repose sur un fond de cèdre clair.',
    price: 89, volume: 50, tone: 'iris',
  },
  {
    slug: 'santal-dore', name: 'Santal Doré', notes: 'Santal · Cardamome · Benjoin',
    description: 'Un santal crémeux réchauffé par la cardamome et le benjoin.',
    price: 92, volume: 50, tone: 'sandal',
  },
];
