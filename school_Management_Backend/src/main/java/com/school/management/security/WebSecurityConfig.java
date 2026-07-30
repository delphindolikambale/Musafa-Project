package com.school.management.security;

import com.school.management.security.jwt.AuthEntryPointJwt;
import com.school.management.security.jwt.AuthTokenFilter;
import com.school.management.security.services.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class WebSecurityConfig implements WebMvcConfigurer {

    private final UserDetailsServiceImpl userDetailsService;
    private final AuthEntryPointJwt unauthorizedHandler;

    // Configuration du mapping des fichiers statiques pour rendre les images locales accessibles
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/storage/**", "/uploads/**")
                .addResourceLocations("file:storage/", "file:uploads/");
    }

    @Bean
    public AuthTokenFilter authenticationJwtTokenFilter() {
        return new AuthTokenFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        return new ProviderManager(List.of(authenticationProvider()));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList(
                "https://musafa-project.onrender.com",
                "http://localhost:3000",
                "http://localhost:5170",
                "http://localhost:5171",
                "http://localhost:5172",
                "http://localhost:5173",
                "http://localhost:5174",
                "http://localhost:5176",
                "http://localhost:5177",
                "http://localhost:5178",
                "http://localhost:5179",
                "http://localhost:5180",
                "http://127.0.0.1:*"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*")); // Permet tous les en-têtes HTTP pour éviter les blocages CORS Preflight
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth ->
                        auth
                                // ✅ 1. Requêtes Preflight CORS (Prise en charge universelle OPTIONS)
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                                // ✅ 2. Endpoints totalement publics
                                .requestMatchers("/api/auth/**").permitAll()
                                .requestMatchers("/api/public/**").permitAll()
                                .requestMatchers("/api/system-admin/public/**").permitAll()
                                .requestMatchers("/api/test/**").permitAll()
                                .requestMatchers("/api/v1/student-payments/**").permitAll()
                                .requestMatchers("/api/resources/**").permitAll()
                                .requestMatchers("/api/files/**").permitAll() // 👈 Route d'accès direct aux fichiers via FileController
                                .requestMatchers("/ws/**").permitAll()
                                .requestMatchers("/favicon.ico").permitAll()
                                .requestMatchers("/storage/**", "/uploads/**").permitAll()

                                // ✅ 3. Endpoints réservés aux Administrateurs Système et École
                                .requestMatchers("/api/system-admin/**").hasAnyAuthority("ROLE_SUPER_ADMIN_SYSTEM", "SUPER_ADMIN_SYSTEM")
                                .requestMatchers("/api/admin/**").hasAnyAuthority("ROLE_ADMIN_SYSTEM", "ADMIN_SYSTEM", "ROLE_ADMIN", "ADMIN")

                                // ✅ 4. Endpoints Métier Authentifiés
                                .requestMatchers("/api/notifications/**").authenticated()
                                .requestMatchers("/api/academic/**", "/api/config/**", "/api/v1/admin/school-config").authenticated()
                                .requestMatchers("/api/levels/**", "/api/sections/**", "/api/options/**", "/api/academic-years/**").authenticated()
                                .requestMatchers("/api/specialities/**", "/api/teacher-assignments/**", "/api/archives/**").authenticated()
                                .requestMatchers("/api/pedagogy/**", "/api/pedagogie/**").authenticated()

                                .anyRequest().authenticated()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}