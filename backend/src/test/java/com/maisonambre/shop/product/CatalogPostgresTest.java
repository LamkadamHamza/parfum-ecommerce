package com.maisonambre.shop.product;

import com.maisonambre.shop.brand.BrandRepository;
import com.maisonambre.shop.category.CategoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("prod")
@TestPropertySource(properties = {
        "spring.datasource.url=${CATALOG_TEST_DB_URL}",
        "spring.datasource.username=${CATALOG_TEST_DB_USER}",
        "spring.datasource.password=${CATALOG_TEST_DB_PASSWORD}"
})
@EnabledIfEnvironmentVariable(named = "CATALOG_TEST_DB_URL", matches = ".+")
@Transactional
@Sql("/catalog-fixtures.sql")
class CatalogPostgresTest {
    @Autowired ProductRepository products;
    @Autowired ProductVariantRepository variants;
    @Autowired BrandRepository brands;
    @Autowired CategoryRepository categories;
    @Autowired MockMvc api;

    @Test
    void repositoryPagesActiveProductsWithStablePriceOrderAndTotal() {
        var first = products.findPublished(null, null, null, null, null, "price,desc", PageRequest.of(0, 2));
        var second = products.findPublished(null, null, null, null, null, "price,desc", PageRequest.of(1, 2));

        assertThat(first.getTotalElements()).isEqualTo(4);
        assertThat(first.getContent()).extracting(ProductRepository.SummaryRow::getSlug)
                .containsExactly("iris-poudre", "ambre-sombre");
        assertThat(second.getContent()).extracting(ProductRepository.SummaryRow::getSlug)
                .containsExactly("ambre-clair", "sans-contenance");
        assertThat(second.getContent().getFirst().getStartingPrice()).isEqualByComparingTo("40.00");
        assertThat(second.getContent().getFirst().getCurrency()).isEqualTo("EUR");
        assertThat(second.getContent().getLast().getStartingPrice()).isNull();
    }

    @Test
    void repositoryCombinesSearchTaxonomyAndInclusiveStartingPrice() {
        var page = products.findPublished("aMbRe", "ambres-test", "maison-test",
                new BigDecimal("40.00"), new BigDecimal("40.00"), "name,asc", PageRequest.of(0, 1));
        assertThat(page.getContent()).extracting(ProductRepository.SummaryRow::getSlug).containsExactly("ambre-clair");

        var noMatch = products.findPublished("ambre", "ambres-test", "maison-test",
                new BigDecimal("45.00"), new BigDecimal("50.00"), "name,asc", PageRequest.of(0, 1));
        assertThat(noMatch).isEmpty();
        assertThat(products.findPublished("%", null, null, null, null, "name,asc", PageRequest.of(0, 12))).isEmpty();
    }

    @Test
    void repositoryReadsStocksAndOnlyPublishedTaxonomy() {
        var id = products.findPublishedBySlug("ambre-clair").orElseThrow().getId();
        assertThat(variants.findVariants(id)).extracting(CatalogDtos.Variant::availableQuantity).containsExactly(5, 0);
        assertThat(products.findPublishedBySlug("ambre-prive")).isEmpty();
        assertThat(brands.findPublished()).extracting(CatalogDtos.Taxon::slug).containsExactly("atelier-test", "maison-test");
        assertThat(categories.findPublished()).extracting(CatalogDtos.Taxon::slug).containsExactly("ambres-test", "floraux-test");
    }

    @Test
    void apiExposesPaginatedListDetailAndTaxonomyWithoutAuthentication() throws Exception {
        api.perform(get("/api/products").param("search", "ambre").param("page", "1").param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].slug").value("ambre-sombre"))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.totalPages").value(2));
        api.perform(get("/api/products/ambre-clair"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.variants[0].availableQuantity").value(5))
                .andExpect(jsonPath("$.variants[1].price.currency").value("USD"));
        api.perform(get("/api/categories")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(2));
        api.perform(get("/api/brands")).andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void apiReturnsNotFoundForUnpublishedAndMissingProducts() throws Exception {
        api.perform(get("/api/products/ambre-prive")).andExpect(status().isNotFound());
        api.perform(get("/api/products/inexistant")).andExpect(status().isNotFound());
    }

    @Test
    void apiRejectsInvalidParametersAndNonPublicRoutes() throws Exception {
        api.perform(get("/api/products").param("size", "49")).andExpect(status().isBadRequest());
        api.perform(get("/api/products").param("page", "abc")).andExpect(status().isBadRequest());
        api.perform(get("/api/products").param("page", "-1")).andExpect(status().isBadRequest());
        api.perform(get("/api/products").param("sort", "sku,asc")).andExpect(status().isBadRequest());
        api.perform(get("/api/products").param("minPrice", "50").param("maxPrice", "30"))
                .andExpect(status().isBadRequest());
        api.perform(get("/api/products").param("maxPrice", "40.001")).andExpect(status().isBadRequest());
        api.perform(get("/api/admin")).andExpect(status().isForbidden());
        api.perform(get("/api/products/ambre-clair/inventory")).andExpect(status().isForbidden());
        api.perform(post("/api/products").with(csrf())).andExpect(status().isForbidden());
    }
}
