package com.maisonambre.shop.product;

import java.math.BigDecimal;
import java.util.List;

public final class CatalogDtos {
    private CatalogDtos() {}

    public record Taxon(String slug, String name) {}

    public record Money(BigDecimal amount, String currency) {}

    public record Summary(String slug, String name, Taxon brand, Taxon category, Money startingPrice) {}

    public record Variant(String sku, int volumeMl, Money price, int availableQuantity) {}

    public record Detail(String slug, String name, String description, Taxon brand, Taxon category,
                         List<Variant> variants) {}

    public record ProductPage(List<Summary> content, int page, int size, long totalElements, int totalPages) {}
}
