package com.khachsan.quanlykhachsan.dto.response;


import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ApiResponse <T>{
    private String status;
    private T data;
    private String error;

    public static <T> ApiResponse<T> success (String status, T data){
        return ApiResponse.<T>builder()
                .status(status)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success (String status){
        return ApiResponse.<T>builder()
                .status(status)
                .build();
    }

    public static <T> ApiResponse<T> error (String status, String error){
        return ApiResponse.<T>builder()
                .status(status)
                .error(error)
                .build();
    }

    public static <T> ApiResponse<T> error (String status){
        return ApiResponse.<T>builder()
                .status(status)
                .build();
    }



}
