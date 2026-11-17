package com.maisonambre.shop.brand;

import com.maisonambre.shop.product.CatalogDtos.Taxon;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface BrandRepository extends Repository<Brand, Long> {
    @Query("""
            select new com.maisonambre.shop.product.CatalogDtos$Taxon(t.slug, t.name)
            from Brand t
            where exists (select p.id from Product p where p.brand = t and p.active = true)
            order by lower(t.name), t.slug
            """)
    List<Taxon> findPublished();
}
