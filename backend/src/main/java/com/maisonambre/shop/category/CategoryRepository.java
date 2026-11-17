package com.maisonambre.shop.category;

import com.maisonambre.shop.product.CatalogDtos.Taxon;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;

import java.util.List;

public interface CategoryRepository extends Repository<Category, Long> {
    @Query("""
            select new com.maisonambre.shop.product.CatalogDtos$Taxon(t.slug, t.name)
            from Category t
            where exists (select p.id from Product p where p.category = t and p.active = true)
            order by lower(t.name), t.slug
            """)
    List<Taxon> findPublished();
}
