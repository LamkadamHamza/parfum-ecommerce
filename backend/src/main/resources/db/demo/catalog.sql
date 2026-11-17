INSERT INTO brands (slug, name) VALUES
    ('maison-ambree', 'Maison Ambrée'), ('atelier-des-bois', 'Atelier des Bois')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO categories (slug, name) VALUES
    ('ambres', 'Ambrés'), ('floraux', 'Floraux'), ('boises', 'Boisés')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (slug, name, description, brand_id, category_id, active)
SELECT demo.slug, demo.name, demo.description, b.id, c.id, true
FROM (VALUES
    ('ambre-nocturne', 'Ambre Nocturne',
        'Un accord d’ambre enveloppant, traversé d’encens et adouci par une vanille sèche.',
        'maison-ambree', 'ambres'),
    ('iris-de-minuit', 'Iris de Minuit',
        'Un iris poudré et frais repose sur un fond de cèdre clair.',
        'maison-ambree', 'floraux'),
    ('santal-dore', 'Santal Doré',
        'Un santal crémeux réchauffé par la cardamome et le benjoin.',
        'atelier-des-bois', 'boises')
) AS demo(slug, name, description, brand_slug, category_slug)
JOIN brands b ON b.slug = demo.brand_slug
JOIN categories c ON c.slug = demo.category_slug
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (product_id, sku, volume_ml, price, currency)
SELECT p.id, demo.sku, demo.volume_ml, demo.price, 'EUR'
FROM (VALUES
    ('ambre-nocturne', 'maison-ambree', 'DEMO-AMB-30', 30, 65.00),
    ('ambre-nocturne', 'maison-ambree', 'DEMO-AMB-50', 50, 95.00),
    ('ambre-nocturne', 'maison-ambree', 'DEMO-AMB-100', 100, 145.00),
    ('iris-de-minuit', 'maison-ambree', 'DEMO-IRI-50', 50, 89.00),
    ('iris-de-minuit', 'maison-ambree', 'DEMO-IRI-100', 100, 135.00),
    ('santal-dore', 'atelier-des-bois', 'DEMO-SAN-30', 30, 62.00),
    ('santal-dore', 'atelier-des-bois', 'DEMO-SAN-50', 50, 92.00)
) AS demo(product_slug, brand_slug, sku, volume_ml, price)
JOIN products p ON p.slug = demo.product_slug
JOIN brands b ON b.id = p.brand_id AND b.slug = demo.brand_slug
ON CONFLICT DO NOTHING;

INSERT INTO inventory (variant_id, quantity_on_hand, quantity_reserved)
SELECT v.id, demo.on_hand, demo.reserved
FROM (VALUES
    ('DEMO-AMB-30', 12, 2), ('DEMO-AMB-50', 8, 1), ('DEMO-AMB-100', 2, 2),
    ('DEMO-IRI-50', 6, 0), ('DEMO-IRI-100', 0, 0),
    ('DEMO-SAN-30', 3, 0), ('DEMO-SAN-50', 9, 2)
) AS demo(sku, on_hand, reserved)
JOIN product_variants v ON v.sku = demo.sku
ON CONFLICT (variant_id) DO NOTHING;
