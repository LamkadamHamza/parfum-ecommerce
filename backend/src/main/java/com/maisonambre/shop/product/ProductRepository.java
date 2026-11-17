package com.maisonambre.shop.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Optional;

public interface ProductRepository extends Repository<Product, Long> {
    String TAXONOMY = """
            from products p
            join brands b on b.id = p.brand_id
            join categories c on c.id = p.category_id
            """;
    String FIELDS = """
            p.slug, p.name, b.slug as "brandSlug", b.name as "brandName",
            c.slug as "categorySlug", c.name as "categoryName"
            """;
    String FILTERS = TAXONOMY + """
            left join lateral (
                select v.price, v.currency
                from product_variants v
                where v.product_id = p.id
                order by v.price, v.volume_ml
                limit 1
            ) entry on true
            where p.active
              and (cast(:search as text) is null or strpos(lower(p.name), lower(:search)) > 0)
              and (cast(:category as text) is null or c.slug = :category)
              and (cast(:brand as text) is null or b.slug = :brand)
              and (cast(:minPrice as numeric) is null or entry.price >= :minPrice)
              and (cast(:maxPrice as numeric) is null or entry.price <= :maxPrice)
            """;

    @Query(nativeQuery = true,
            value = "select " + FIELDS + """
                    , entry.price as "startingPrice", entry.currency
                    """ + FILTERS + """
                    order by
                      case when :sort = 'name,asc' then lower(p.name) end asc,
                      case when :sort = 'name,desc' then lower(p.name) end desc,
                      case when :sort = 'price,asc' then entry.price end asc nulls last,
                      case when :sort = 'price,desc' then entry.price end desc nulls last,
                      p.slug
                    """,
            countQuery = "select count(*) " + FILTERS)
    Page<SummaryRow> findPublished(@Param("search") String search, @Param("category") String category,
                                   @Param("brand") String brand, @Param("minPrice") BigDecimal minPrice,
                                   @Param("maxPrice") BigDecimal maxPrice, @Param("sort") String sort,
                                   Pageable pageable);

    @Query(nativeQuery = true, value = "select " + FIELDS + """
            , p.id, p.description
            """ + TAXONOMY + "where p.active and p.slug = :slug")
    Optional<DetailRow> findPublishedBySlug(@Param("slug") String slug);

    interface ProductRow {
        String getSlug();
        String getName();
        String getBrandSlug();
        String getBrandName();
        String getCategorySlug();
        String getCategoryName();
    }

    interface SummaryRow extends ProductRow {
        BigDecimal getStartingPrice();
        String getCurrency();
    }

    interface DetailRow extends ProductRow {
        long getId();
        String getDescription();
    }
}
