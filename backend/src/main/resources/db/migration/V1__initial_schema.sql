CREATE TABLE categories (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(120) NOT NULL,
    slug varchar(120) NOT NULL UNIQUE
);

CREATE TABLE brands (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name varchar(120) NOT NULL,
    slug varchar(120) NOT NULL UNIQUE
);

CREATE TABLE products (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    brand_id bigint NOT NULL REFERENCES brands(id),
    category_id bigint NOT NULL REFERENCES categories(id),
    name varchar(160) NOT NULL,
    slug varchar(160) NOT NULL UNIQUE,
    description text NOT NULL DEFAULT '',
    active boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX products_brand_idx ON products (brand_id);
CREATE INDEX products_category_idx ON products (category_id);

CREATE TABLE product_variants (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    product_id bigint NOT NULL REFERENCES products(id),
    sku varchar(64) NOT NULL UNIQUE,
    volume_ml integer NOT NULL CHECK (volume_ml > 0),
    price numeric(12,2) NOT NULL CHECK (price >= 0),
    currency varchar(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
    UNIQUE (product_id, volume_ml)
);

CREATE TABLE inventory (
    variant_id bigint PRIMARY KEY REFERENCES product_variants(id),
    quantity_on_hand integer NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    quantity_reserved integer NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
    updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (quantity_reserved <= quantity_on_hand)
);

CREATE TABLE customers (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email varchar(254) NOT NULL CHECK (email = btrim(email) AND email <> ''),
    first_name varchar(100) NOT NULL,
    last_name varchar(100) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX customers_email_idx ON customers (lower(email));

CREATE TABLE orders (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    customer_id bigint NOT NULL REFERENCES customers(id),
    status varchar(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'PAID', 'SHIPPED', 'CANCELLED')),
    currency varchar(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
    total_amount numeric(14,2) NOT NULL CHECK (total_amount >= 0),
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX orders_customer_idx ON orders (customer_id);

CREATE TABLE order_items (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id bigint NOT NULL REFERENCES orders(id),
    variant_id bigint NOT NULL REFERENCES product_variants(id),
    product_name varchar(160) NOT NULL,
    sku varchar(64) NOT NULL,
    quantity integer NOT NULL CHECK (quantity > 0),
    unit_price numeric(12,2) NOT NULL CHECK (unit_price >= 0),
    UNIQUE (order_id, variant_id)
);

CREATE INDEX order_items_variant_idx ON order_items (variant_id);
