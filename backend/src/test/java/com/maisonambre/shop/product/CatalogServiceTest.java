package com.maisonambre.shop.product;

import com.maisonambre.shop.brand.BrandRepository;
import com.maisonambre.shop.category.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CatalogServiceTest {
    @Mock ProductRepository products;
    @Mock ProductVariantRepository variants;
    @Mock CategoryRepository categories;
    @Mock BrandRepository brands;
    @Mock ProductRepository.SummaryRow summary;
    private CatalogService catalog;

    @BeforeEach
    void setUp() {
        catalog = new CatalogService(products, variants, categories, brands);
    }

    @Test
    void mapsProductPageWithExactMoneyAndTotal() {
        var request = PageRequest.of(0, 1);
        var price = new BigDecimal("40.05");
        when(products.findPublished("Ambre", null, null, null, null, "price,asc", request))
                .thenReturn(new PageImpl<>(List.of(summary), request, 2));
        when(summary.getStartingPrice()).thenReturn(price);
        when(summary.getCurrency()).thenReturn("EUR");

        var page = catalog.findProducts(new CatalogQuery(0, 1, " Ambre ", null, null, null, null, "price,asc"));

        assertThat(page.content().getFirst().startingPrice()).isEqualTo(new CatalogDtos.Money(price, "EUR"));
        assertThat(page.totalPages()).isEqualTo(2);
        verifyNoInteractions(variants);
    }

    @Test
    void missingSlugDoesNotQueryVariants() {
        when(products.findPublishedBySlug("absent")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> catalog.findProduct("absent"))
                .isInstanceOfSatisfying(ResponseStatusException.class, e -> assertThat(e.getStatusCode().value()).isEqualTo(404));
        verifyNoInteractions(variants);
    }
}
