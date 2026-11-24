package com.khachsan.quanlykhachsan.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Kết quả đọc/xác thực file Excel hoặc xác nhận nhập dữ liệu.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExcelImportResponse {

    private String loaiDuLieu;
    private String tenFile;
    private Integer tongSoDong;
    private Integer soDongHopLe;
    private Integer soDongLoi;
    private Integer soDongDaNhap;
    private Boolean thanhCong;
    private String thongBao;
    private List<DongPhong> danhSachDong;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DongPhong {
        private Integer soDongExcel;
        private String maPhong;
        private String soPhong;
        private String maLoai;
        private String tenLoai;
        private String moTa;
        private String giaPhong;
        private String trangThai;
        private Boolean hopLe;
        private List<String> loi;
    }
}
