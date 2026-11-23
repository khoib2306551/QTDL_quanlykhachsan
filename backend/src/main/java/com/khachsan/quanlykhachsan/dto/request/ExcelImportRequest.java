package com.khachsan.quanlykhachsan.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Request xác nhận ghi dữ liệu đã xem trước từ file Excel vào database.
 * Phiên bản hiện tại chỉ hỗ trợ loại dữ liệu PHONG.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExcelImportRequest {

    private String loaiDuLieu;
    private List<DongPhongImport> danhSachPhong;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DongPhongImport {
        private Integer soDongExcel;
        private String maPhong;
        private String soPhong;
        private String maLoai;
        private String tenLoai;
        private String moTa;
        private String giaPhong;
        private String trangThai;
    }
}
