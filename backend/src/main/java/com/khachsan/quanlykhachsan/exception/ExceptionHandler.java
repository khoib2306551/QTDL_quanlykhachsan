package com.khachsan.quanlykhachsan.exception;

import com.khachsan.quanlykhachsan.dto.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionHandler {
    // handle exception here

    @org.springframework.web.bind.annotation.ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleResourceNotFound(ResourceNotFoundException ex){
        return new ResponseEntity<>(ApiResponse.error("error", ex.getMessage()),HttpStatus.NOT_FOUND);
    }

    @org.springframework.web.bind.annotation.ExceptionHandler(AuthException.class)
    public ResponseEntity<ApiResponse<?>> handleAuthException(AuthException ex){
        return new ResponseEntity<>(ApiResponse.error("error", ex.getMessage()),HttpStatus.UNAUTHORIZED);
    }
    @org.springframework.web.bind.annotation.ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<?>> authExceptionHandle(AuthenticationException ex){
        return new ResponseEntity<>(ApiResponse.error("error", ex.getMessage()),HttpStatus.UNAUTHORIZED);
    }
    @org.springframework.web.bind.annotation.ExceptionHandler(MissingParamException.class)
    public ResponseEntity<ApiResponse<?>> authMissingParamHandle(MissingParamException ex){
        return new ResponseEntity<>(ApiResponse.error("error", ex.getMessage()),HttpStatus.BAD_REQUEST);
    }



}
