package com.maisonambre.shop.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class HttpSecurityConfiguration {
    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, Environment environment) throws Exception {
        return http.authorizeHttpRequests(requests -> {
            requests.requestMatchers(HttpMethod.GET, "/api/health").permitAll();
            if (environment.acceptsProfiles(Profiles.of("dev & !prod"))) {
                requests.requestMatchers(HttpMethod.GET, "/v3/api-docs", "/v3/api-docs/**",
                        "/swagger-ui.html", "/swagger-ui/**").permitAll();
            }
            requests.anyRequest().denyAll();
        }).build();
    }
}
