package com.maisonambre.shop.product;

import com.maisonambre.shop.product.CatalogDtos.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Catalogue")
public class CatalogController {
    private final CatalogService catalog;

    public CatalogController(CatalogService catalog) {
        this.catalog = catalog;
    }

    @GetMapping("/products")
    @Operation(summary = "Lister les parfums publiés",
            description = "Le prix de départ est celui de la variante la moins chère. La page commence à zéro.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Page de produits", useReturnTypeSchema = true),
                    @ApiResponse(responseCode = "400", description = "Paramètres invalides",
                            content = @Content(mediaType = "application/problem+json",
                                    schema = @Schema(implementation = ProblemDetail.class)))
            })
    public ProductPage products(
            @Parameter(description = "Index de page à partir de zéro") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Taille de page entre 1 et 48") @RequestParam(defaultValue = "12") int size,
            @Parameter(description = "Sous-chaîne du nom, sans distinction de casse") @RequestParam(required = false) String search,
            @Parameter(description = "Slug de catégorie") @RequestParam(required = false) String category,
            @Parameter(description = "Slug de marque") @RequestParam(required = false) String brand,
            @Parameter(description = "Prix de départ minimum inclus") @RequestParam(required = false) BigDecimal minPrice,
            @Parameter(description = "Prix de départ maximum inclus") @RequestParam(required = false) BigDecimal maxPrice,
            @Parameter(description = "name,asc | name,desc | price,asc | price,desc")
            @RequestParam(defaultValue = "name,asc") String sort) {
        return catalog.findProducts(new CatalogQuery(page, size, search, category, brand, minPrice, maxPrice, sort));
    }

    @GetMapping("/products/{slug}")
    @Operation(summary = "Consulter un parfum publié, ses contenances et le stock disponible",
            responses = {
                    @ApiResponse(responseCode = "200", description = "Fiche du parfum", useReturnTypeSchema = true),
                    @ApiResponse(responseCode = "404", description = "Parfum inexistant ou non publié",
                            content = @Content(mediaType = "application/problem+json",
                                    schema = @Schema(implementation = ProblemDetail.class)))
            })
    public Detail product(@PathVariable String slug) {
        return catalog.findProduct(slug);
    }

    @GetMapping("/categories")
    @Operation(summary = "Lister les catégories contenant des parfums publiés")
    public List<Taxon> categories() {
        return catalog.findCategories();
    }

    @GetMapping("/brands")
    @Operation(summary = "Lister les marques contenant des parfums publiés")
    public List<Taxon> brands() {
        return catalog.findBrands();
    }
}
