package com.khachsan.quanlykhachsan.exception;

import com.khachsan.quanlykhachsan.dto.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionHandler {
    // handle exception here

    @org.springframework.web.bind.annotation.ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleResourceNotFound(ResourceNotFoundException ex){
        return new ResponseEntity<>(ApiResponse.error("error", ex.getMessage()),HttpStatus.NOT_FOUND);
    }
}
