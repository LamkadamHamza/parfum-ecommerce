INSERT INTO brands (slug, name) VALUES ('maison-test', 'Maison Test'), ('atelier-test', 'Atelier Test'), ('prive', 'Privé');
INSERT INTO categories (slug, name) VALUES ('ambres-test', 'Ambrés'), ('floraux-test', 'Floraux'), ('privee', 'Privée');

INSERT INTO products (slug, name, description, brand_id, category_id, active)
SELECT fixture.slug, fixture.name, 'Description de test', b.id, c.id, fixture.active
FROM (VALUES
    ('ambre-clair', 'Ambre Clair', 'maison-test', 'ambres-test', true),
    ('ambre-sombre', 'Ambre Sombre', 'atelier-test', 'ambres-test', true),
    ('iris-poudre', 'Iris Poudré', 'maison-test', 'floraux-test', true),
    ('sans-contenance', 'Sans contenance', 'maison-test', 'floraux-test', true),
    ('ambre-prive', 'Ambre Privé', 'prive', 'privee', false)
) AS fixture(slug, name, brand_slug, category_slug, active)
JOIN brands b ON b.slug = fixture.brand_slug
JOIN categories c ON c.slug = fixture.category_slug;

INSERT INTO product_variants (product_id, sku, volume_ml, price, currency)
SELECT p.id, fixture.sku, fixture.volume_ml, fixture.price, fixture.currency
FROM (VALUES
    ('ambre-clair', 'ACL-30', 30, 40.00, 'EUR'),
    ('ambre-clair', 'ACL-50', 50, 50.00, 'USD'),
    ('ambre-sombre', 'ASO-50', 50, 70.00, 'EUR'),
    ('iris-poudre', 'IPO-50', 50, 80.00, 'EUR'),
    ('ambre-prive', 'APR-50', 50, 20.00, 'EUR')
) AS fixture(slug, sku, volume_ml, price, currency)
JOIN products p ON p.slug = fixture.slug;

INSERT INTO inventory (variant_id, quantity_on_hand, quantity_reserved)
SELECT id, 8, 3 FROM product_variants WHERE sku = 'ACL-30';
