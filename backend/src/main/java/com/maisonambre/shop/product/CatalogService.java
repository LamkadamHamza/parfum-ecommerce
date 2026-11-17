package com.maisonambre.shop.product;

import com.maisonambre.shop.brand.BrandRepository;
import com.maisonambre.shop.category.CategoryRepository;
import com.maisonambre.shop.product.CatalogDtos.*;
import com.maisonambre.shop.product.ProductRepository.ProductRow;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CatalogService {
    private final ProductRepository products;
    private final ProductVariantRepository variants;
    private final CategoryRepository categories;
    private final BrandRepository brands;

    public CatalogService(ProductRepository products, ProductVariantRepository variants,
                          CategoryRepository categories, BrandRepository brands) {
        this.products = products;
        this.variants = variants;
        this.categories = categories;
        this.brands = brands;
    }

    public ProductPage findProducts(CatalogQuery query) {
        var result = products.findPublished(query.search(), query.category(), query.brand(), query.minPrice(),
                query.maxPrice(), query.sort(), PageRequest.of(query.page(), query.size()));
        var content = result.getContent().stream()
                .map(row -> new Summary(row.getSlug(), row.getName(), brand(row), category(row),
                        row.getStartingPrice() == null ? null : new Money(row.getStartingPrice(), row.getCurrency())))
                .toList();
        return new ProductPage(content, result.getNumber(), result.getSize(), result.getTotalElements(),
                result.getTotalPages());
    }

    public Detail findProduct(String slug) {
        if (slug.length() > 160 || slug.indexOf(0) >= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug de produit invalide.");
        }
        var row = products.findPublishedBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Parfum introuvable."));
        return new Detail(row.getSlug(), row.getName(), row.getDescription(), brand(row), category(row),
                variants.findVariants(row.getId()));
    }

    public List<Taxon> findCategories() {
        return categories.findPublished();
    }

    public List<Taxon> findBrands() {
        return brands.findPublished();
    }

    private Taxon brand(ProductRow row) {
        return new Taxon(row.getBrandSlug(), row.getBrandName());
    }

    private Taxon category(ProductRow row) {
        return new Taxon(row.getCategorySlug(), row.getCategoryName());
    }
}
