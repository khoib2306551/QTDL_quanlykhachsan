package com.khachsan.quanlykhachsan.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ThongKeResponse {

    // Thông tin mốc thời gian
    private LocalDate mocThoiGian;
    private Integer nam;
    private Integer tuanThu;
    private Integer thang;
    private Integer quy;

    // Các chỉ số doanh thu tại mốc thời gian tương ứng
    private Long soLuongHoaDon;
    private BigDecimal hoaDonCaoNhat;
    private BigDecimal hoaDonThapNhat;
    private BigDecimal trungBinhHoaDon;
    private BigDecimal tongDoanhThu;
}
