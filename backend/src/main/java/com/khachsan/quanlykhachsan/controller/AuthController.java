package com.khachsan.quanlykhachsan.controller;

import com.khachsan.quanlykhachsan.dto.request.auth.LoginRequest;
import com.khachsan.quanlykhachsan.dto.request.auth.RegisterRequest;
import com.khachsan.quanlykhachsan.dto.response.ApiResponse;
import com.khachsan.quanlykhachsan.dto.response.auth.AuthResponse;
import com.khachsan.quanlykhachsan.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    @PostMapping("/dang-ky")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request){
        AuthResponse response = this.authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("success",response));
    }

    @PostMapping("/dang-nhap")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody LoginRequest request){
        AuthResponse response = this.authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("success",response));
    }
}
