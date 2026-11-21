package com.khachsan.quanlykhachsan.config.security;

import com.khachsan.quanlykhachsan.dto.response.ApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException, ServletException {

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());

        String jwtError = (String) request.getAttribute("jwt_error");
        String errorMessage = (jwtError != null)
                ? jwtError
                : "Bạn chưa đăng nhập hoặc token không hợp lệ.";

        ApiResponse<Void> apiResponse = ApiResponse.error(
                String.valueOf(HttpStatus.UNAUTHORIZED.value()),
                errorMessage
        );

        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
}