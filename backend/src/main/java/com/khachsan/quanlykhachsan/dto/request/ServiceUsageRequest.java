package com.khachsan.quanlykhachsan.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class ServiceUsageRequest {
    @NotBlank
    private String maThue;
    @NotBlank
    private String maDichVu;
    @Min(1)
    private int soLuong;
    @NotNull
    private LocalDate ngaySuDung;
}