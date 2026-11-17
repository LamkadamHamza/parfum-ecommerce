package com.maisonambre.shop.product;

import com.maisonambre.shop.product.CatalogDtos.Variant;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductVariantRepository extends Repository<ProductVariant, Long> {
    @Query("""
            select new com.maisonambre.shop.product.CatalogDtos$Variant(
                v.sku, v.volumeMl,
                new com.maisonambre.shop.product.CatalogDtos$Money(v.price, v.currency),
                coalesce(i.quantityOnHand - i.quantityReserved, 0))
            from ProductVariant v
            left join Inventory i on i.variant = v
            where v.product.id = :productId
            order by v.volumeMl
            """)
    List<Variant> findVariants(@Param("productId") long productId);
}
