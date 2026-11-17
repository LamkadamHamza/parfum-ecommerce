package com.maisonambre.shop.product;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Set;

record CatalogQuery(int page, int size, String search, String category, String brand,
                    BigDecimal minPrice, BigDecimal maxPrice, String sort) {
    private static final Set<String> SORTS = Set.of("name,asc", "name,desc", "price,asc", "price,desc");
    private static final BigDecimal MAX_PRICE = new BigDecimal("9999999999.99");

    CatalogQuery {
        if (page < 0 || size < 1 || size > 48 || (long) page * size > Integer.MAX_VALUE) {
            throw invalid("Page positive ou nulle et taille comprise entre 1 et 48 attendues.");
        }
        search = optionalText(search, 160, "search", true);
        category = optionalText(category, 120, "category", false);
        brand = optionalText(brand, 120, "brand", false);
        validatePrice(minPrice);
        validatePrice(maxPrice);
        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw invalid("minPrice doit être inférieur ou égal à maxPrice.");
        }
        if (!SORTS.contains(sort)) {
            throw invalid("Tri autorisé : name,asc ; name,desc ; price,asc ; price,desc.");
        }
    }

    private static String optionalText(String value, int maxLength, String parameter, boolean allowBlank) {
        if (value == null) {
            return null;
        }
        if (value.length() > maxLength || value.indexOf(0) >= 0 || (!allowBlank && value.isBlank())) {
            throw invalid("Paramètre " + parameter + " invalide.");
        }
        if (allowBlank) {
            return value.strip();
        }
        return value;
    }

    private static void validatePrice(BigDecimal price) {
        if (price != null && (price.signum() < 0 || price.scale() > 2 || price.compareTo(MAX_PRICE) > 0)) {
            throw invalid("Un prix doit être positif ou nul et comporter au plus deux décimales.");
        }
    }

    private static ResponseStatusException invalid(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}
