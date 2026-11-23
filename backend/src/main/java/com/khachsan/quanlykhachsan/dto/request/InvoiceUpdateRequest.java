package com.khachsan.quanlykhachsan.dto.request;

import jakarta.validation.constraints.DecimalMin;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class InvoiceUpdateRequest {
    private String maSddv;
    private LocalDate ngayLapHoaDon;
    @DecimalMin("0")
    private BigDecimal tongTien;
}