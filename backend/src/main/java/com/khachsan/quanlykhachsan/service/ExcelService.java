package com.khachsan.quanlykhachsan.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.DataFormat;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.VerticalAlignment;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.khachsan.quanlykhachsan.dto.response.ChiSoTongHopResponse;
import com.khachsan.quanlykhachsan.dto.response.ThongKeResponse;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExcelService {

    private static final String SQL_XUAT_PHONG = """
            SELECT
                p.MaPhong,
                p.SoPhong,
                lp.MaLoai,
                lp.TenLoai,
                lp.MoTa,
                lp.GiaPhong,
                p.TrangThai
            FROM Phong p
            INNER JOIN LoaiPhong lp ON lp.MaLoai = p.MaLoai
            ORDER BY p.SoPhong ASC
            """;

    private static final String SQL_XUAT_THUE_PHONG = """
            SELECT
                tp.MaThue,
                kh.MaKhachHang,
                kh.TenKhachHang,
                kh.SoDienThoai,
                p.MaPhong,
                p.SoPhong,
                lp.TenLoai,
                lp.GiaPhong,
                tp.NgayThue,
                tp.NgayNhan,
                tp.NgayTra,
                fn_TinhSoNgayLuuTru(tp.NgayNhan, tp.NgayTra) AS SoNgayLuuTru,
                tp.TrangThai
            FROM ThuePhong tp
            INNER JOIN KhachHang kh ON kh.MaKhachHang = tp.MaKhachHang
            INNER JOIN Phong p ON p.MaPhong = tp.MaPhong
            INNER JOIN LoaiPhong lp ON lp.MaLoai = p.MaLoai
            ORDER BY tp.NgayNhan DESC, tp.MaThue ASC
            """;

   
    private static final String SQL_XUAT_HOA_DON = """
            SELECT
                hd.MaHoaDon,
                hd.NgayLapHoaDon,
                hd.MaSDDV,
                anchor.MaThue,
                kh.MaKhachHang,
                kh.TenKhachHang,
                kh.SoDienThoai,
                p.MaPhong,
                p.SoPhong,
                hd.TongTien
            FROM HoaDon hd
            LEFT JOIN SuDungDichVu anchor ON anchor.MaSDDV = hd.MaSDDV
            LEFT JOIN ThuePhong tp ON tp.MaThue = anchor.MaThue
            LEFT JOIN KhachHang kh ON kh.MaKhachHang = tp.MaKhachHang
            LEFT JOIN Phong p ON p.MaPhong = tp.MaPhong
            ORDER BY hd.NgayLapHoaDon DESC, hd.MaHoaDon ASC
            """;

    
    private static final String SQL_XUAT_CHI_TIET_HOA_DON = """
            SELECT
                hd.MaHoaDon,
                anchor.MaThue,
                sd.MaSDDV,
                sd.MaDichVu,
                dv.TenDichVu,
                sd.SoLuong,
                sd.NgaySuDung,
                dv.GiaDichVu,
                (sd.SoLuong * dv.GiaDichVu) AS ThanhTien
            FROM HoaDon hd
            LEFT JOIN SuDungDichVu anchor ON anchor.MaSDDV = hd.MaSDDV
            LEFT JOIN SuDungDichVu sd ON sd.MaThue = anchor.MaThue
            LEFT JOIN DichVu dv ON dv.MaDichVu = sd.MaDichVu
            ORDER BY hd.MaHoaDon ASC, sd.NgaySuDung ASC, sd.MaSDDV ASC
            """;

    private final JdbcTemplate jdbcTemplate;
    private final ThongKeService thongKeService;

    public byte[] xuatDanhSachPhong() {
        XSSFWorkbook workbook = new XSSFWorkbook();
        try (workbook) {
            writeSqlSheet(
                    workbook,
                    "DanhSachPhong",
                    SQL_XUAT_PHONG,
                    new String[]{"MaPhong", "SoPhong", "MaLoai", "TenLoai", "MoTa", "GiaPhong", "TrangThai"},
                    new String[]{"Mã phòng", "Số phòng", "Mã loại", "Tên loại phòng", "Mô tả", "Giá phòng", "Trạng thái"}
            );
            return toBytes(workbook);
        } catch (IOException exception) {
            throw new IllegalStateException("Không thể đóng workbook Excel", exception);
        }
    }

    public byte[] xuatDanhSachThuePhong() {
        XSSFWorkbook workbook = new XSSFWorkbook();
        try (workbook) {
            writeSqlSheet(
                    workbook,
                    "DanhSachThuePhong",
                    SQL_XUAT_THUE_PHONG,
                    new String[]{"MaThue", "MaKhachHang", "TenKhachHang", "SoDienThoai", "MaPhong", "SoPhong",
                            "TenLoai", "GiaPhong", "NgayThue", "NgayNhan", "NgayTra", "SoNgayLuuTru", "TrangThai"},
                    new String[]{"Mã thuê", "Mã khách hàng", "Tên khách hàng", "Số điện thoại", "Mã phòng", "Số phòng",
                            "Loại phòng", "Giá phòng/ngày", "Ngày thuê", "Ngày nhận", "Ngày trả", "Số ngày lưu trú", "Trạng thái"}
            );
            return toBytes(workbook);
        } catch (IOException exception) {
            throw new IllegalStateException("Không thể đóng workbook Excel", exception);
        }
    }

    public byte[] xuatDanhSachHoaDon() {
        XSSFWorkbook workbook = new XSSFWorkbook();
        try (workbook) {
            writeSqlSheet(
                    workbook,
                    "HoaDon",
                    SQL_XUAT_HOA_DON,
                    new String[]{"MaHoaDon", "NgayLapHoaDon", "MaSDDV", "MaThue", "MaKhachHang", "TenKhachHang",
                            "SoDienThoai", "MaPhong", "SoPhong", "TongTien"},
                    new String[]{"Mã hóa đơn", "Ngày lập", "Mã SDDV tham chiếu", "Mã thuê", "Mã khách hàng", "Tên khách hàng",
                            "Số điện thoại", "Mã phòng", "Số phòng", "Tổng tiền"}
            );
            writeSqlSheet(
                    workbook,
                    "ChiTietDichVu",
                    SQL_XUAT_CHI_TIET_HOA_DON,
                    new String[]{"MaHoaDon", "MaThue", "MaSDDV", "MaDichVu", "TenDichVu", "SoLuong",
                            "NgaySuDung", "GiaDichVu", "ThanhTien"},
                    new String[]{"Mã hóa đơn", "Mã thuê", "Mã SDDV", "Mã dịch vụ", "Tên dịch vụ", "Số lượng",
                            "Ngày sử dụng", "Đơn giá", "Thành tiền"}
            );
            return toBytes(workbook);
        } catch (IOException exception) {
            throw new IllegalStateException("Không thể đóng workbook Excel", exception);
        }
    }

    
    public byte[] xuatBaoCaoThongKe(
            String kieuThongKe,
            Integer nam,
            Integer quy,
            LocalDate tuNgay,
            LocalDate denNgay) {

        List<ThongKeResponse> chiTiet;
        ChiSoTongHopResponse chiSoTongHop;
        String moTaKyBaoCao;
        LocalDate ngayBatDau;
        LocalDate ngayKetThuc;

        if (tuNgay != null || denNgay != null) {
            if (tuNgay == null || denNgay == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Phải cung cấp đồng thời tuNgay và denNgay"
                );
            }
            if (tuNgay.isAfter(denNgay)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Ngày bắt đầu không được lớn hơn ngày kết thúc"
                );
            }

            ngayBatDau = tuNgay;
            ngayKetThuc = denNgay;
            moTaKyBaoCao = "Từ " + tuNgay + " đến " + denNgay;
            chiTiet = thongKeService.thongKeTuNgayDenNgay(tuNgay, denNgay);
            chiSoTongHop = thongKeService.layChiSoTongHop(tuNgay, denNgay);
        } else {
            int namBaoCao = nam != null ? nam : Year.now().getValue();
            String kieu = (kieuThongKe == null || kieuThongKe.isBlank())
                    ? "THANG"
                    : kieuThongKe.trim().toUpperCase();

            if (quy != null && !"QUY".equals(kieu)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Chỉ truyền tham số quy khi kieuThongKe=QUY"
                );
            }

            if (quy != null) {
                if (quy < 1 || quy > 4) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quý phải nằm trong khoảng 1 đến 4");
                }
                chiTiet = List.of(thongKeService.thongKeTheoQuy(quy, namBaoCao));
                ngayBatDau = LocalDate.of(namBaoCao, (quy - 1) * 3 + 1, 1);
                ngayKetThuc = ngayBatDau.plusMonths(3).minusDays(1);
                moTaKyBaoCao = "Quý " + quy + "/" + namBaoCao;
            } else {
                chiTiet = thongKeService.thongKeDoanhThu(kieu, namBaoCao);
                ngayBatDau = LocalDate.of(namBaoCao, 1, 1);
                ngayKetThuc = LocalDate.of(namBaoCao, 12, 31);
                moTaKyBaoCao = kieu + " năm " + namBaoCao;
            }
            chiSoTongHop = thongKeService.layChiSoTongHop(ngayBatDau, ngayKetThuc);
        }

        XSSFWorkbook workbook = new XSSFWorkbook();
        try (workbook) {
            writeSummarySheet(workbook, moTaKyBaoCao, ngayBatDau, ngayKetThuc, chiSoTongHop);
            writeStatisticsSheet(workbook, chiTiet);
            return toBytes(workbook);
        } catch (IOException exception) {
            throw new IllegalStateException("Không thể đóng workbook Excel", exception);
        }
    }

    private void writeSummarySheet(
            XSSFWorkbook workbook,
            String moTaKyBaoCao,
            LocalDate tuNgay,
            LocalDate denNgay,
            ChiSoTongHopResponse chiSo) {

        Sheet sheet = workbook.createSheet("TongQuan");
        CellStyle titleStyle = createTitleStyle(workbook);
        CellStyle labelStyle = createLabelStyle(workbook);
        CellStyle moneyStyle = createMoneyStyle(workbook);

        Row titleRow = sheet.createRow(0);
        titleRow.setHeightInPoints(26);
        Cell title = titleRow.createCell(0);
        title.setCellValue("BÁO CÁO THỐNG KÊ DOANH THU");
        title.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 1));

        addLabelValueRow(sheet, 2, "Kỳ báo cáo", moTaKyBaoCao, labelStyle, null);
        addLabelValueRow(sheet, 3, "Từ ngày", tuNgay, labelStyle, null);
        addLabelValueRow(sheet, 4, "Đến ngày", denNgay, labelStyle, null);
        addLabelValueRow(sheet, 6, "Số lượng hóa đơn", chiSo.getSoLuongHoaDon(), labelStyle, null);
        addLabelValueRow(sheet, 7, "Hóa đơn cao nhất", chiSo.getHoaDonCaoNhat(), labelStyle, moneyStyle);
        addLabelValueRow(sheet, 8, "Hóa đơn thấp nhất", chiSo.getHoaDonThapNhat(), labelStyle, moneyStyle);
        addLabelValueRow(sheet, 9, "Trung bình hóa đơn", chiSo.getTrungBinhHoaDon(), labelStyle, moneyStyle);
        addLabelValueRow(sheet, 10, "Tổng doanh thu", chiSo.getTongDoanhThu(), labelStyle, moneyStyle);

        sheet.setColumnWidth(0, 30 * 256);
        sheet.setColumnWidth(1, 28 * 256);
        sheet.createFreezePane(0, 1);
    }

    private void writeStatisticsSheet(XSSFWorkbook workbook, List<ThongKeResponse> rows) {
        Sheet sheet = workbook.createSheet("ChiTietDoanhThu");
        String[] headers = {"Mốc thời gian", "Năm", "Tuần", "Tháng", "Quý", "Số hóa đơn",
                "Hóa đơn cao nhất", "Hóa đơn thấp nhất", "Trung bình hóa đơn", "Tổng doanh thu"};
        createHeaderRow(workbook, sheet, headers);

        int rowIndex = 1;
        for (ThongKeResponse item : rows) {
            Row row = sheet.createRow(rowIndex++);
            setCellValue(row.createCell(0), item.getMocThoiGian());
            setCellValue(row.createCell(1), item.getNam());
            setCellValue(row.createCell(2), item.getTuanThu());
            setCellValue(row.createCell(3), item.getThang());
            setCellValue(row.createCell(4), item.getQuy());
            setCellValue(row.createCell(5), item.getSoLuongHoaDon());
            setCellValue(row.createCell(6), item.getHoaDonCaoNhat());
            setCellValue(row.createCell(7), item.getHoaDonThapNhat());
            setCellValue(row.createCell(8), item.getTrungBinhHoaDon());
            setCellValue(row.createCell(9), item.getTongDoanhThu());
        }

        applyColumnFormats(sheet, headers.length);
        sheet.setAutoFilter(new CellRangeAddress(0, Math.max(0, rowIndex - 1), 0, headers.length - 1));
        sheet.createFreezePane(0, 1);
    }

    private void writeSqlSheet(
            XSSFWorkbook workbook,
            String sheetName,
            String sql,
            String[] databaseColumns,
            String[] headers) {

        Sheet sheet = workbook.createSheet(sheetName);
        createHeaderRow(workbook, sheet, headers);
        int[] rowIndex = {1};

        jdbcTemplate.query(sql, (RowCallbackHandler) resultSet -> {
    Row row = sheet.createRow(rowIndex[0]++);

    for (int column = 0; column < databaseColumns.length; column++) {
        Object value = resultSet.getObject(databaseColumns[column]);
        setCellValue(row.createCell(column), value);
    }
});

        applyColumnFormats(sheet, headers.length);
        sheet.setAutoFilter(new CellRangeAddress(0, Math.max(0, rowIndex[0] - 1), 0, headers.length - 1));
        sheet.createFreezePane(0, 1);
    }

    private void createHeaderRow(XSSFWorkbook workbook, Sheet sheet, String[] headers) {
        Row header = sheet.createRow(0);
        header.setHeightInPoints(24);
        CellStyle style = createHeaderStyle(workbook);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
    }

    private void applyColumnFormats(Sheet sheet, int columnCount) {
        DataFormat dataFormat = sheet.getWorkbook().createDataFormat();
        CellStyle moneyStyle = sheet.getWorkbook().createCellStyle();
        moneyStyle.setDataFormat(dataFormat.getFormat("#,##0.00"));

        for (int column = 0; column < columnCount; column++) {
            sheet.autoSizeColumn(column);
            int currentWidth = sheet.getColumnWidth(column);
            sheet.setColumnWidth(column, Math.min(Math.max(currentWidth + 512, 12 * 256), 60 * 256));

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;
                Cell cell = row.getCell(column);
                if (cell == null) continue;
                if (cell.getCellType() == org.apache.poi.ss.usermodel.CellType.NUMERIC) {
                    String header = sheet.getRow(0).getCell(column).getStringCellValue().toLowerCase();
                    if (header.contains("tiền") || header.contains("doanh thu") || header.contains("đơn giá")
                            || header.contains("giá") || header.contains("thành tiền") || header.contains("cao nhất") || header.contains("thấp nhất") || header.contains("trung bình")) {
                        cell.setCellStyle(moneyStyle);
                    }
                }
            }
        }
    }

    private void setCellValue(Cell cell, Object value) {
        if (value == null) {
            cell.setBlank();
        } else if (value instanceof LocalDate localDate) {
            cell.setCellValue(java.sql.Date.valueOf(localDate));
            CellStyle style = cell.getSheet().getWorkbook().createCellStyle();
            style.setDataFormat(cell.getSheet().getWorkbook().createDataFormat().getFormat("dd/mm/yyyy"));
            cell.setCellStyle(style);
        } else if (value instanceof Date sqlDate) {
            cell.setCellValue(sqlDate);
            CellStyle style = cell.getSheet().getWorkbook().createCellStyle();
            style.setDataFormat(cell.getSheet().getWorkbook().createDataFormat().getFormat("dd/mm/yyyy"));
            cell.setCellStyle(style);
        } else if (value instanceof Timestamp timestamp) {
            cell.setCellValue(timestamp);
        } else if (value instanceof BigDecimal decimal) {
            cell.setCellValue(decimal.doubleValue());
        } else if (value instanceof Number number) {
            cell.setCellValue(number.doubleValue());
        } else if (value instanceof Boolean bool) {
            cell.setCellValue(bool);
        } else {
            // Luôn ghi dữ liệu dạng text, không diễn giải chuỗi thành công thức Excel.
            cell.setCellValue(value.toString());
        }
    }

    private void addLabelValueRow(
            Sheet sheet,
            int rowIndex,
            String label,
            Object value,
            CellStyle labelStyle,
            CellStyle valueStyle) {
        Row row = sheet.createRow(rowIndex);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(labelStyle);
        Cell valueCell = row.createCell(1);
        setCellValue(valueCell, value);
        if (valueStyle != null) valueCell.setCellStyle(valueStyle);
    }

    private CellStyle createHeaderStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        return style;
    }

    private CellStyle createTitleStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 15);
        font.setColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFont(font);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createLabelStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        return style;
    }

    private CellStyle createMoneyStyle(XSSFWorkbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setDataFormat(workbook.createDataFormat().getFormat("#,##0.00"));
        return style;
    }

    private byte[] toBytes(XSSFWorkbook workbook) {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            workbook.write(output);
            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("Không thể tạo file Excel", exception);
        }
    }
}
