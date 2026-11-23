package com.khachsan.quanlykhachsan.service;

import java.io.IOException;
import java.io.InputStream;
import java.text.Normalizer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.khachsan.quanlykhachsan.dto.request.ExcelImportRequest;
import com.khachsan.quanlykhachsan.dto.response.ExcelImportResponse;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class ExcelImportService {

    private static final long MAX_FILE_SIZE = 10L * 1024L * 1024L;
    private static final int MAX_ROWS = 1000;
    private static final String LOAI_DU_LIEU_PHONG = "PHONG";
    private static final String SQL_INSERT_PHONG = """
            INSERT INTO Phong (MaPhong, MaLoai, SoPhong, TrangThai)
            VALUES (?, ?, ?, ?)
            """;

    private static final Set<String> TRANG_THAI_HOP_LE = Set.of("Trống", "Đang sử dụng");

    private final JdbcTemplate jdbcTemplate;

    /** Đọc file .xlsx và trả về dữ liệu xem trước kèm lỗi theo từng dòng. */
    @Transactional(readOnly = true)
    public ExcelImportResponse docFile(MultipartFile file) {
        kiemTraFile(file);

        List<ExcelImportResponse.DongPhong> rows = docCacDongPhong(file);
        kiemTraDuLieuPhong(rows);

        long validCount = rows.stream().filter(row -> Boolean.TRUE.equals(row.getHopLe())).count();
        int invalidCount = rows.size() - (int) validCount;

        return ExcelImportResponse.builder()
                .loaiDuLieu(LOAI_DU_LIEU_PHONG)
                .tenFile(file.getOriginalFilename())
                .tongSoDong(rows.size())
                .soDongHopLe((int) validCount)
                .soDongLoi(invalidCount)
                .soDongDaNhap(0)
                .thanhCong(invalidCount == 0)
                .thongBao(invalidCount == 0
                        ? "Đọc file thành công. Dữ liệu hợp lệ, có thể xác nhận nhập."
                        : "Đã đọc file. Vui lòng xử lý các dòng có lỗi trước khi xác nhận nhập.")
                .danhSachDong(rows)
                .build();
    }

   
    @Transactional
    public ExcelImportResponse ghiDatabase(ExcelImportRequest request) {
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu dữ liệu nhập Excel");
        }
        if (request.getLoaiDuLieu() == null
                || !LOAI_DU_LIEU_PHONG.equalsIgnoreCase(request.getLoaiDuLieu().trim())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Hiện chỉ hỗ trợ nhập dữ liệu PHONG. Các loại dữ liệu khác cần được nhóm thống nhất."
            );
        }
        if (request.getDanhSachPhong() == null || request.getDanhSachPhong().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Danh sách phòng không được để trống");
        }
        if (request.getDanhSachPhong().size() > MAX_ROWS) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mỗi lần chỉ được nhập tối đa " + MAX_ROWS + " dòng"
            );
        }

        List<ExcelImportResponse.DongPhong> rows = request.getDanhSachPhong().stream()
                .map(this::toPreviewRow)
                .toList();

        kiemTraDuLieuPhong(rows);

        List<ExcelImportResponse.DongPhong> invalidRows = rows.stream()
                .filter(row -> !Boolean.TRUE.equals(row.getHopLe()))
                .toList();

        if (!invalidRows.isEmpty()) {
            long validCount = rows.size() - invalidRows.size();
            return ExcelImportResponse.builder()
                    .loaiDuLieu(LOAI_DU_LIEU_PHONG)
                    .tongSoDong(rows.size())
                    .soDongHopLe((int) validCount)
                    .soDongLoi(invalidRows.size())
                    .soDongDaNhap(0)
                    .thanhCong(false)
                    .thongBao("Dữ liệu đã thay đổi hoặc không còn hợp lệ. Không có dòng nào được ghi vào database.")
                    .danhSachDong(rows)
                    .build();
        }

        List<ExcelImportRequest.DongPhongImport> data = request.getDanhSachPhong();
        jdbcTemplate.batchUpdate(
                SQL_INSERT_PHONG,
                data,
                Math.min(data.size(), 250),
                (preparedStatement, row) -> {
                    preparedStatement.setString(1, trim(row.getMaPhong()));
                    preparedStatement.setString(2, trim(row.getMaLoai()));
                    preparedStatement.setString(3, trim(row.getSoPhong()));
                    preparedStatement.setString(4, trim(row.getTrangThai()));
                }
        );

        return ExcelImportResponse.builder()
                .loaiDuLieu(LOAI_DU_LIEU_PHONG)
                .tongSoDong(rows.size())
                .soDongHopLe(rows.size())
                .soDongLoi(0)
                .soDongDaNhap(rows.size())
                .thanhCong(true)
                .thongBao("Đã nhập thành công " + rows.size() + " phòng.")
                .danhSachDong(rows)
                .build();
    }

    private void kiemTraFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vui lòng chọn file Excel");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Kích thước file không được vượt quá 10 MB");
        }
        String fileName = file.getOriginalFilename();
        if (fileName == null || !fileName.toLowerCase(Locale.ROOT).endsWith(".xlsx")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chỉ chấp nhận file có định dạng .xlsx");
        }
    }

    private List<ExcelImportResponse.DongPhong> docCacDongPhong(MultipartFile file) {
        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(inputStream)) {

            if (workbook.getNumberOfSheets() == 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Workbook không có worksheet");
            }

            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Worksheet không có dòng tiêu đề");
            }

            DataFormatter formatter = new DataFormatter(Locale.ROOT);
            Map<String, Integer> columns = mapColumns(headerRow, formatter);
            requireColumn(columns, "maPhong", "Mã phòng / MaPhong");
            requireColumn(columns, "soPhong", "Số phòng / SoPhong");
            requireColumn(columns, "maLoai", "Mã loại / MaLoai");
            requireColumn(columns, "trangThai", "Trạng thái / TrangThai");

            List<ExcelImportResponse.DongPhong> rows = new ArrayList<>();
            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row excelRow = sheet.getRow(rowIndex);
                if (isBlankRow(excelRow, formatter)) {
                    continue;
                }
                if (rows.size() >= MAX_ROWS) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "File vượt quá giới hạn " + MAX_ROWS + " dòng dữ liệu"
                    );
                }

                ExcelImportResponse.DongPhong row = ExcelImportResponse.DongPhong.builder()
                        .soDongExcel(rowIndex + 1)
                        .maPhong(readValue(excelRow, columns.get("maPhong"), formatter))
                        .soPhong(readValue(excelRow, columns.get("soPhong"), formatter))
                        .maLoai(readValue(excelRow, columns.get("maLoai"), formatter))
                        .tenLoai(readOptionalValue(excelRow, columns.get("tenLoai"), formatter))
                        .moTa(readOptionalValue(excelRow, columns.get("moTa"), formatter))
                        .giaPhong(readOptionalValue(excelRow, columns.get("giaPhong"), formatter))
                        .trangThai(readValue(excelRow, columns.get("trangThai"), formatter))
                        .build();
                rows.add(row);
            }

            if (rows.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File không có dòng dữ liệu phòng");
            }
            return rows;
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (IOException | RuntimeException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Không thể đọc file Excel. Hãy kiểm tra lại định dạng và nội dung file .xlsx",
                    exception
            );
        }
    }

    private Map<String, Integer> mapColumns(Row headerRow, DataFormatter formatter) {
        Map<String, Integer> columns = new HashMap<>();
        for (int index = 0; index < headerRow.getLastCellNum(); index++) {
            Cell cell = headerRow.getCell(index, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
            if (cell == null) continue;
            String key = normalizeHeader(formatter.formatCellValue(cell));
            switch (key) {
                case "maphong", "roomcode" -> columns.put("maPhong", index);
                case "sophong", "roomnumber" -> columns.put("soPhong", index);
                case "maloai", "roomtypecode" -> columns.put("maLoai", index);
                case "tenloai", "tenloaiphong", "roomtypename" -> columns.put("tenLoai", index);
                case "mota", "description" -> columns.put("moTa", index);
                case "giaphong", "price" -> columns.put("giaPhong", index);
                case "trangthai", "status" -> columns.put("trangThai", index);
                default -> {
                    // Bỏ qua các cột không thuộc mẫu nhập phòng.
                }
            }
        }
        return columns;
    }

    private String normalizeHeader(String value) {
        String normalized = Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT);
        return normalized.replaceAll("[^a-z0-9]", "");
    }

    private void requireColumn(Map<String, Integer> columns, String key, String displayName) {
        if (!columns.containsKey(key)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Thiếu cột bắt buộc: " + displayName
            );
        }
    }

    private String readValue(Row row, Integer columnIndex, DataFormatter formatter) {
        if (columnIndex == null) return "";
        Cell cell = row.getCell(columnIndex, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
        if (cell == null) return "";
        if (cell.getCellType() == CellType.FORMULA) return "#CONG_THUC_EXCEL#";
        return trim(formatter.formatCellValue(cell));
    }

    private String readOptionalValue(Row row, Integer columnIndex, DataFormatter formatter) {
        if (columnIndex == null) return null;
        return readValue(row, columnIndex, formatter);
    }

    private boolean isBlankRow(Row row, DataFormatter formatter) {
        if (row == null) return true;
        for (int index = 0; index < row.getLastCellNum(); index++) {
            Cell cell = row.getCell(index, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
            if (cell != null && !formatter.formatCellValue(cell).isBlank()) {
                return false;
            }
        }
        return true;
    }

    /** Kiểm tra dữ liệu với database và các dòng khác trong cùng file/request. */
    private void kiemTraDuLieuPhong(List<ExcelImportResponse.DongPhong> rows) {
        Set<String> existingRoomIds = new HashSet<>(jdbcTemplate.query(
                "SELECT MaPhong FROM Phong",
                (resultSet, rowNumber) -> key(resultSet.getString(1))
        ));
        Set<String> existingRoomNumbers = new HashSet<>(jdbcTemplate.query(
                "SELECT SoPhong FROM Phong",
                (resultSet, rowNumber) -> key(resultSet.getString(1))
        ));
        Set<String> existingRoomTypes = new HashSet<>(jdbcTemplate.query(
                "SELECT MaLoai FROM LoaiPhong",
                (resultSet, rowNumber) -> key(resultSet.getString(1))
        ));

        Set<String> seenRoomIds = new HashSet<>();
        Set<String> seenRoomNumbers = new HashSet<>();

        for (ExcelImportResponse.DongPhong row : rows) {
            List<String> errors = new ArrayList<>();
            String maPhong = trim(row.getMaPhong());
            String soPhong = trim(row.getSoPhong());
            String maLoai = trim(row.getMaLoai());
            String trangThai = trim(row.getTrangThai());

            if (maPhong.isEmpty()) {
                errors.add("Mã phòng không được để trống");
            } else {
                if (maPhong.length() > 10) errors.add("Mã phòng không được vượt quá 10 ký tự");
                String idKey = key(maPhong);
                if (existingRoomIds.contains(idKey) || !seenRoomIds.add(idKey)) {
                    errors.add("Mã phòng đã tồn tại trong database hoặc bị trùng trong file");
                }
            }

            if (soPhong.isEmpty()) {
                errors.add("Số phòng không được để trống");
            } else {
                if (soPhong.length() > 20) errors.add("Số phòng không được vượt quá 20 ký tự");
                String numberKey = key(soPhong);
                if (existingRoomNumbers.contains(numberKey) || !seenRoomNumbers.add(numberKey)) {
                    errors.add("Số phòng đã tồn tại trong database hoặc bị trùng trong file");
                }
            }

            if (maLoai.isEmpty()) {
                errors.add("Mã loại phòng không được để trống");
            } else if (maLoai.length() > 10) {
                errors.add("Mã loại phòng không được vượt quá 10 ký tự");
            } else if (!existingRoomTypes.contains(key(maLoai))) {
                errors.add("Mã loại phòng không tồn tại trong database");
            }

            if ("#CONG_THUC_EXCEL#".equals(maPhong)
                    || "#CONG_THUC_EXCEL#".equals(soPhong)
                    || "#CONG_THUC_EXCEL#".equals(maLoai)
                    || "#CONG_THUC_EXCEL#".equals(trangThai)) {
                errors.add("Không chấp nhận công thức Excel trong các cột dữ liệu bắt buộc");
            }

            if (trangThai.isEmpty()) {
                errors.add("Trạng thái không được để trống");
            } else if (!TRANG_THAI_HOP_LE.contains(trangThai)) {
                errors.add("Trạng thái chỉ được là 'Trống' hoặc 'Đang sử dụng'");
            }

            row.setHopLe(errors.isEmpty());
            row.setLoi(errors);
        }
    }

    private ExcelImportResponse.DongPhong toPreviewRow(ExcelImportRequest.DongPhongImport input) {
        if (input == null) {
            return ExcelImportResponse.DongPhong.builder()
                    .hopLe(false)
                    .loi(List.of("Dòng dữ liệu không hợp lệ"))
                    .build();
        }
        return ExcelImportResponse.DongPhong.builder()
                .soDongExcel(input.getSoDongExcel())
                .maPhong(trim(input.getMaPhong()))
                .soPhong(trim(input.getSoPhong()))
                .maLoai(trim(input.getMaLoai()))
                .tenLoai(trim(input.getTenLoai()))
                .moTa(trim(input.getMoTa()))
                .giaPhong(trim(input.getGiaPhong()))
                .trangThai(trim(input.getTrangThai()))
                .build();
    }

    private String key(String value) {
        return trim(value).toUpperCase(Locale.ROOT);
    }

    private String trim(String value) {
        return value == null ? "" : value.trim();
    }
}
