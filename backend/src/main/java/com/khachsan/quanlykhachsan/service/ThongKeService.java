package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.dto.response.ChiSoTongHopResponse;
import com.khachsan.quanlykhachsan.dto.response.ThongKeResponse;
import com.khachsan.quanlykhachsan.repository.ThongKeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;

/**
 * Xử lý nghiệp vụ thống kê doanh thu.
 *
 * Nguồn dữ liệu:
 * - HoaDon.NgayLapHoaDon: thời gian ghi nhận doanh thu.
 * - HoaDon.TongTien: số tiền dùng để thống kê.
 *
 * Lưu ý: database hiện tại chưa có trạng thái thanh toán/hủy hóa đơn,
 * vì vậy service thống kê tất cả hóa đơn nằm trong khoảng thời gian được chọn.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ThongKeService {

    private static final Set<String> KIEU_THONG_KE_HOP_LE =
            Set.of("NGAY", "TUAN", "THANG", "QUY", "NAM");

    private static final int NAM_NHO_NHAT = 1000;
    private static final int NAM_LON_NHAT = 9999;
    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final ThongKeRepository thongKeRepository;

    /**
     * Thống kê doanh thu theo kiểu NGAY, TUAN, THANG, QUY hoặc NAM
     * trong năm được chọn.
     */
    public List<ThongKeResponse> thongKeDoanhThu(String kieuThongKe, Integer nam) {
        String kieuDaChuanHoa = chuanHoaKieuThongKe(kieuThongKe);
        kiemTraNam(nam);

        List<Object[]> rows = thongKeRepository.thongKeDoanhThu(kieuDaChuanHoa, nam);
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }

        return rows.stream()
                .map(row -> chuyenDongStoredProcedure(row, kieuDaChuanHoa))
                .toList();
    }

    /**
     * Thống kê doanh thu theo từng ngày trong khoảng ngày tùy chọn.
     * Hai đầu mốc đều được tính vào kết quả.
     */
    public List<ThongKeResponse> thongKeTuNgayDenNgay(LocalDate tuNgay, LocalDate denNgay) {
        kiemTraKhoangNgay(tuNgay, denNgay);

        List<Object[]> rows = thongKeRepository.thongKeTuNgayDenNgay(tuNgay, denNgay);
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }

        return rows.stream()
                .map(this::chuyenDongThongKeTheoNgay)
                .toList();
    }

    /**
     * Lấy kết quả của riêng một quý trong năm.
     * Stored procedure trả về các quý có phát sinh hóa đơn trong năm;
     * nếu quý được chọn chưa có hóa đơn, service trả về các chỉ số bằng 0.
     */
    public ThongKeResponse thongKeTheoQuy(Integer quy, Integer nam) {
        if (quy == null || quy < 1 || quy > 4) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quý phải là số nguyên từ 1 đến 4"
            );
        }
        kiemTraNam(nam);

        return thongKeDoanhThu("QUY", nam).stream()
                .filter(item -> Objects.equals(item.getQuy(), quy))
                .findFirst()
                .orElseGet(() -> taoKetQuaQuyRong(quy, nam));
    }

    /**
     * Lấy các chỉ số tổng hợp trong khoảng ngày được chọn.
     */
    public ChiSoTongHopResponse layChiSoTongHop(LocalDate tuNgay, LocalDate denNgay) {
        kiemTraKhoangNgay(tuNgay, denNgay);

        Object[] row = thongKeRepository.layChiSoTongHop(tuNgay, denNgay);
        if (row == null || row.length < 5) {
            throw new IllegalStateException(
                    "Không nhận được đầy đủ dữ liệu chỉ số tổng hợp từ database"
            );
        }

        return ChiSoTongHopResponse.builder()
                .soLuongHoaDon(toLong(row[0]))
                .hoaDonCaoNhat(toBigDecimal(row[1]))
                .hoaDonThapNhat(toBigDecimal(row[2]))
                .trungBinhHoaDon(toBigDecimal(row[3]))
                .tongDoanhThu(toBigDecimal(row[4]))
                .build();
    }

    private String chuanHoaKieuThongKe(String kieuThongKe) {
        if (kieuThongKe == null || kieuThongKe.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Kiểu thống kê không được để trống"
            );
        }

        String kieu = kieuThongKe.trim().toUpperCase();
        if (!KIEU_THONG_KE_HOP_LE.contains(kieu)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Kiểu thống kê không hợp lệ. Chỉ chấp nhận: NGAY, TUAN, THANG, QUY, NAM"
            );
        }
        return kieu;
    }

    private void kiemTraNam(Integer nam) {
        if (nam == null || nam < NAM_NHO_NHAT || nam > NAM_LON_NHAT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Năm thống kê phải nằm trong khoảng 1000 đến 9999"
            );
        }
    }

    private void kiemTraKhoangNgay(LocalDate tuNgay, LocalDate denNgay) {
        if (tuNgay == null || denNgay == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ngày bắt đầu và ngày kết thúc không được để trống"
            );
        }
        if (tuNgay.isAfter(denNgay)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc"
            );
        }
    }

    /**
     * Ánh xạ các cấu trúc Object[] khác nhau do stored procedure trả về.
     */
    private ThongKeResponse chuyenDongStoredProcedure(Object[] row, String kieuThongKe) {
        if (row == null) {
            throw new IllegalStateException("Một dòng dữ liệu thống kê trả về null");
        }

        return switch (kieuThongKe) {
            case "NGAY" -> {
                kiemTraSoCot(row, 6, kieuThongKe);
                yield ThongKeResponse.builder()
                        .mocThoiGian(toLocalDate(row[0]))
                        .soLuongHoaDon(toLong(row[1]))
                        .hoaDonCaoNhat(toBigDecimal(row[2]))
                        .hoaDonThapNhat(toBigDecimal(row[3]))
                        .trungBinhHoaDon(toBigDecimal(row[4]))
                        .tongDoanhThu(toBigDecimal(row[5]))
                        .build();
            }
            case "TUAN", "THANG", "QUY" -> {
                kiemTraSoCot(row, 7, kieuThongKe);
                ThongKeResponse.ThongKeResponseBuilder builder = ThongKeResponse.builder()
                        .nam(toInteger(row[0]))
                        .soLuongHoaDon(toLong(row[2]))
                        .hoaDonCaoNhat(toBigDecimal(row[3]))
                        .hoaDonThapNhat(toBigDecimal(row[4]))
                        .trungBinhHoaDon(toBigDecimal(row[5]))
                        .tongDoanhThu(toBigDecimal(row[6]));

                Integer moc = toInteger(row[1]);
                switch (kieuThongKe) {
                    case "TUAN" -> builder.tuanThu(moc);
                    case "THANG" -> builder.thang(moc);
                    case "QUY" -> builder.quy(moc);
                    default -> throw new IllegalStateException("Kiểu thống kê không được hỗ trợ: " + kieuThongKe);
                }
                yield builder.build();
            }
            case "NAM" -> {
                kiemTraSoCot(row, 6, kieuThongKe);
                yield ThongKeResponse.builder()
                        .nam(toInteger(row[0]))
                        .soLuongHoaDon(toLong(row[1]))
                        .hoaDonCaoNhat(toBigDecimal(row[2]))
                        .hoaDonThapNhat(toBigDecimal(row[3]))
                        .trungBinhHoaDon(toBigDecimal(row[4]))
                        .tongDoanhThu(toBigDecimal(row[5]))
                        .build();
            }
            default -> throw new IllegalStateException("Kiểu thống kê không được hỗ trợ: " + kieuThongKe);
        };
    }

    private ThongKeResponse chuyenDongThongKeTheoNgay(Object[] row) {
        kiemTraSoCot(row, 6, "thống kê theo khoảng ngày");
        return ThongKeResponse.builder()
                .mocThoiGian(toLocalDate(row[0]))
                .soLuongHoaDon(toLong(row[1]))
                .hoaDonCaoNhat(toBigDecimal(row[2]))
                .hoaDonThapNhat(toBigDecimal(row[3]))
                .trungBinhHoaDon(toBigDecimal(row[4]))
                .tongDoanhThu(toBigDecimal(row[5]))
                .build();
    }

    private ThongKeResponse taoKetQuaQuyRong(Integer quy, Integer nam) {
        return ThongKeResponse.builder()
                .nam(nam)
                .quy(quy)
                .soLuongHoaDon(0L)
                .hoaDonCaoNhat(ZERO)
                .hoaDonThapNhat(ZERO)
                .trungBinhHoaDon(ZERO)
                .tongDoanhThu(ZERO)
                .build();
    }

    private void kiemTraSoCot(Object[] row, int soCotToiThieu, String loaiKetQua) {
        if (row.length < soCotToiThieu) {
            throw new IllegalStateException(
                    "Cấu trúc kết quả " + loaiKetQua + " không đúng: cần ít nhất "
                            + soCotToiThieu + " cột nhưng nhận được " + row.length
            );
        }
    }

    private LocalDate toLocalDate(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDate localDate) {
            return localDate;
        }
        if (value instanceof Date sqlDate) {
            return sqlDate.toLocalDate();
        }
        if (value instanceof Timestamp timestamp) {
            return timestamp.toLocalDateTime().toLocalDate();
        }
        if (value instanceof LocalDateTime localDateTime) {
            return localDateTime.toLocalDate();
        }
        return LocalDate.parse(value.toString());
    }

    private Integer toInteger(Object value) {
        if (value == null) {
            return 0;
        }
        if (value instanceof Number number) {
            return number.intValue();
        }
        return Integer.parseInt(value.toString());
    }

    private Long toLong(Object value) {
        if (value == null) {
            return 0L;
        }
        if (value instanceof Number number) {
            return number.longValue();
        }
        return Long.parseLong(value.toString());
    }

    private BigDecimal toBigDecimal(Object value) {
        if (value == null) {
            return ZERO;
        }
        if (value instanceof BigDecimal bigDecimal) {
            return bigDecimal;
        }
        if (value instanceof Number number) {
            return new BigDecimal(number.toString());
        }
        return new BigDecimal(value.toString());
    }
}
