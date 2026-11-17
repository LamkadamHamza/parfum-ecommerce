package com.maisonambre.shop.common;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthController {
    @Operation(summary = "Vérifie que le processus HTTP répond")
    @GetMapping("/api/health")
    public Health health() {
        return new Health("UP");
    }

    public record Health(String status) {}
}
