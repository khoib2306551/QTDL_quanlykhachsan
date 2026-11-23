package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.dto.request.ThuePhongRequest;
import com.khachsan.quanlykhachsan.dto.response.ThuePhongResponse;
import com.khachsan.quanlykhachsan.entity.KhachHang;
import com.khachsan.quanlykhachsan.entity.Phong;
import com.khachsan.quanlykhachsan.entity.ThuePhong;
import com.khachsan.quanlykhachsan.exception.ResourceNotFoundException;
import com.khachsan.quanlykhachsan.repository.KhachHangRepository;
import com.khachsan.quanlykhachsan.repository.PhongRepository;
import com.khachsan.quanlykhachsan.repository.ThuePhongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ThuePhongService {

    private final ThuePhongRepository thuePhongRepository;
    private final KhachHangRepository khachHangRepository;
    private final PhongRepository phongRepository;

    public List<ThuePhongResponse> layDanhSachThuePhong() {
        return thuePhongRepository.layDanhSachThuePhongKemSoNgay()
                .stream()
                .map(this::mapRowToResponse)
                .collect(Collectors.toList());
    }

    public Integer tinhSoNgayLuuTru(LocalDate ngayNhan, LocalDate ngayTra) {
        if (ngayNhan == null || ngayTra == null) {
            return 0;
        }
        return thuePhongRepository.tinhSoNgayLuuTru(ngayNhan, ngayTra);
    }

    @Transactional(readOnly = true)
    public List<ThuePhongResponse> timTheoThoiGian(LocalDate ngayBatDau, LocalDate ngayKetThuc) {
        return thuePhongRepository.timTheoThoiGian(ngayBatDau, ngayKetThuc)
                .stream()
                .map(this::mapRowToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ThuePhong taoPhieuThue(ThuePhongRequest req) {
        if (req.getNgayNhan() != null && req.getNgayTra() != null && req.getNgayTra().isBefore(req.getNgayNhan())) {
            throw new IllegalArgumentException("Ngày trả phòng phải lớn hơn hoặc bằng ngày nhận phòng");
        }

        String maThue = (req.getMaThue() == null || req.getMaThue().trim().isEmpty())
                ? taoMaThueTuDong()
                : req.getMaThue().trim();

        if (thuePhongRepository.existsById(maThue)) {
            throw new IllegalArgumentException("Mã thuê phòng " + maThue + " đã tồn tại");
        }

        KhachHang kh = khachHangRepository.findById(req.getMaKhachHang())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng mã " + req.getMaKhachHang()));

        Phong phong = phongRepository.findById(req.getMaPhong())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng mã " + req.getMaPhong()));

        ThuePhong tp = ThuePhong.builder()
                .maThue(maThue)
                .khachHang(kh)
                .phong(phong)
                .ngayThue(req.getNgayThue() != null ? req.getNgayThue() : LocalDate.now())
                .ngayNhan(req.getNgayNhan())
                .ngayTra(req.getNgayTra())
                .trangThai(req.getTrangThai() != null && !req.getTrangThai().isBlank() ? req.getTrangThai() : "Đã đặt")
                .build();

        return thuePhongRepository.save(tp);
    }

    @Transactional
    public ThuePhong capNhatPhieuThue(String maThue, ThuePhongRequest req) {
        ThuePhong hienTai = thuePhongRepository.findById(maThue)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiếu thuê có mã " + maThue));

        if (req.getNgayNhan() != null && req.getNgayTra() != null && req.getNgayTra().isBefore(req.getNgayNhan())) {
            throw new IllegalArgumentException("Ngày trả phòng phải lớn hơn hoặc bằng ngày nhận phòng");
        }

        if (req.getMaKhachHang() != null && !req.getMaKhachHang().isBlank()) {
            KhachHang kh = khachHangRepository.findById(req.getMaKhachHang())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng mã " + req.getMaKhachHang()));
            hienTai.setKhachHang(kh);
        }

        if (req.getMaPhong() != null && !req.getMaPhong().isBlank()) {
            Phong phong = phongRepository.findById(req.getMaPhong())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phòng mã " + req.getMaPhong()));
            hienTai.setPhong(phong);
        }

        if (req.getNgayThue() != null) hienTai.setNgayThue(req.getNgayThue());
        if (req.getNgayNhan() != null) hienTai.setNgayNhan(req.getNgayNhan());
        if (req.getNgayTra() != null) hienTai.setNgayTra(req.getNgayTra());
        if (req.getTrangThai() != null && !req.getTrangThai().isBlank()) {
            hienTai.setTrangThai(req.getTrangThai());
        }

        return thuePhongRepository.save(hienTai);
    }

    @Transactional
    public void xoaPhieuThue(String maThue) {
        ThuePhong hienTai = thuePhongRepository.findById(maThue)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phiếu thuê có mã " + maThue));

        Phong phong = hienTai.getPhong();
        thuePhongRepository.delete(hienTai);

        if (phong != null && !"Trống".equals(phong.getTrangThai())) {
            phong.setTrangThai("Trống");
            phongRepository.save(phong);
        }
    }

    private String taoMaThueTuDong() {
        Long maxSo = thuePhongRepository.layMaSoLonNhat();
        long nextSo = (maxSo == null ? 0 : maxSo) + 1;
        String maMoi = String.format("TP%02d", nextSo);
        while (thuePhongRepository.existsById(maMoi)) {
            nextSo++;
            maMoi = String.format("TP%02d", nextSo);
        }
        return maMoi;
    }

    private ThuePhongResponse mapRowToResponse(Object[] row) {
        return ThuePhongResponse.builder()
                .maThue(toStringVal(row[0]))
                .maKhachHang(toStringVal(row[1]))
                .tenKhachHang(toStringVal(row[2]))
                .soDienThoai(toStringVal(row[3]))
                .maPhong(toStringVal(row[4]))
                .soPhong(toStringVal(row[5]))
                .tenLoai(toStringVal(row[6]))
                .giaPhong(toBigDecimalVal(row[7]))
                .ngayThue(toLocalDateVal(row[8]))
                .ngayNhan(toLocalDateVal(row[9]))
                .ngayTra(toLocalDateVal(row[10]))
                .soNgayLuuTru(toIntVal(row[11]))
                .trangThai(toStringVal(row[12]))
                .build();
    }

    private String toStringVal(Object val) {
        return val != null ? val.toString() : null;
    }

    private Integer toIntVal(Object val) {
        if (val instanceof Number) {
            return ((Number) val).intValue();
        }
        return 0;
    }

    private BigDecimal toBigDecimalVal(Object val) {
        if (val instanceof BigDecimal) return (BigDecimal) val;
        if (val instanceof Number) return BigDecimal.valueOf(((Number) val).doubleValue());
        return null;
    }

    private LocalDate toLocalDateVal(Object val) {
        if (val instanceof LocalDate) return (LocalDate) val;
        if (val instanceof Date) return ((Date) val).toLocalDate();
        if (val != null) return LocalDate.parse(val.toString());
        return null;
    }
}