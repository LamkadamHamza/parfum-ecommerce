package com.maisonambre.shop.inventory;

import com.maisonambre.shop.product.ProductVariant;
import jakarta.persistence.*;

import java.time.Instant;

@Entity
@Table(name = "inventory")
public class Inventory {
    @Id
    @Column(name = "variant_id")
    private Long variantId;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "variant_id")
    private ProductVariant variant;

    @Column(name = "quantity_on_hand", nullable = false)
    private int quantityOnHand;

    @Column(name = "quantity_reserved", nullable = false)
    private int quantityReserved;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Inventory() {}
}
