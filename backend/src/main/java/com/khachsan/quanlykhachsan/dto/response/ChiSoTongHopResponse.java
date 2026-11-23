package com.khachsan.quanlykhachsan.dto.response;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * DTO chứa các chỉ số tổng hợp doanh thu trong khoảng thời gian được chọn.
 *
 * Dữ liệu được lấy từ bảng HoaDon, dựa trên NgayLapHoaDon và TongTien.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChiSoTongHopResponse {

    private Long soLuongHoaDon;

    private BigDecimal hoaDonCaoNhat;

    private BigDecimal hoaDonThapNhat;

    private BigDecimal trungBinhHoaDon;

    private BigDecimal tongDoanhThu;
}
