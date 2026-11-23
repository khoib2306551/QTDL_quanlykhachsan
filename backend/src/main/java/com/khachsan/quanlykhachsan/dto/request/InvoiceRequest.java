package com.khachsan.quanlykhachsan.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
public class InvoiceRequest {
    @NotBlank
    private String maSddv;
    private LocalDate ngayLapHoaDon;
}