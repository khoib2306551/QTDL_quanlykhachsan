package com.khachsan.quanlykhachsan.config.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableWebSecurity
public class SecurityConfig {

    @Value("${cors.allowed-origins}")
    private  String[] allowOrigins;
    private final JwtFilter jwtFilter;
    private final CustomAuthenticationEntryPoint entryPoint;
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception{
        httpSecurity.
                csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .cors(cors -> cors.configurationSource(this.configurationSource()))
                .authorizeHttpRequests(request
                -> request.requestMatchers("/api/auth/**").permitAll()
                                .anyRequest().authenticated()
                )
                .exceptionHandling(handle -> handle.authenticationEntryPoint(entryPoint))
                .addFilterBefore(this.jwtFilter, UsernamePasswordAuthenticationFilter.class);


        return httpSecurity.build();
    }

    private CorsConfigurationSource configurationSource(){
        CorsConfiguration source = new CorsConfiguration();
        source.setAllowedMethods(List.of("OPTIONS","GET","POST","PATCH","PUT","DELETE"));
        source.setAllowCredentials(true);
        source.setAllowedHeaders(List.of("*"));
        source.setAllowedOriginPatterns(List.of(this.allowOrigins));
        UrlBasedCorsConfigurationSource build = new UrlBasedCorsConfigurationSource();
        build.registerCorsConfiguration("/**",source);
        return build;
    }




    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration){
        return configuration.getAuthenticationManager();
    }

}
