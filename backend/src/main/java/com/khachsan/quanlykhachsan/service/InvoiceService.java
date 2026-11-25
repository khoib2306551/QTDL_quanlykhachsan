package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.dto.PageResponse;
import com.khachsan.quanlykhachsan.dto.response.TongTienResponse;
import com.khachsan.quanlykhachsan.dto.response.hoadon.HoaDonListResponse;
import com.khachsan.quanlykhachsan.entity.HoaDon;
import com.khachsan.quanlykhachsan.entity.SuDungDichVu;
import com.khachsan.quanlykhachsan.entity.ThuePhong;
import com.khachsan.quanlykhachsan.exception.ResourceNotFoundException;
import com.khachsan.quanlykhachsan.repository.HoaDonRepository;
import com.khachsan.quanlykhachsan.dto.response.sddv.SuDungDichVuListResponse;
import com.khachsan.quanlykhachsan.repository.SuDungDichVuRepository;
import com.khachsan.quanlykhachsan.exception.BusinessException;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class InvoiceService {
    private final HoaDonRepository repo;
    private final SuDungDichVuRepository sddvRepo;
    public record HoaDonRequest(String maThue, LocalDate ngayLapHoaDon) {
    }

    public PageResponse<HoaDonListResponse> timKiem(String maHoaDon, LocalDate tuNgay, LocalDate denNgay,
                                                    String sortBy, String sortDir, int page, int size) {
        if (tuNgay != null && denNgay != null && tuNgay.isAfter(denNgay)) {
            throw new BusinessException("Từ ngày không được sau đến ngày");
        }
        // Chỉ cho sắp xếp theo 2 cột này, giá trị khác thì dùng mặc định
        String cot = "tongTien".equals(sortBy) ? "tongTien" : "ngayLapHoaDon";
        Sort.Direction chieu = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(Math.max(page - 1, 0), size,
                Sort.by(chieu, cot).and(Sort.by(Sort.Direction.ASC, "maHoaDon")));
        return PageResponse.from(
                repo.timKiemNangCao(maHoaDon.trim(), tuNgay, denNgay, pageable)
                        .map(this::toListResponse));
    }

    private HoaDonListResponse toListResponse(HoaDon hd) {
        SuDungDichVu sd = hd.getSuDungDichVu();
        if (sd == null) {
            return new HoaDonListResponse(hd.getMaHoaDon(), null, null, null, null, null,
                    hd.getNgayLapHoaDon(), null, null, hd.getTongTien());
        }
        ThuePhong tp = sd.getThuePhong();
        HoaDonRepository.ChiPhiThue cp = repo.layChiPhiThue(tp.getMaThue());
        return new HoaDonListResponse(
                hd.getMaHoaDon(),
                sd.getMaSDDV(),
                tp.getMaThue(),
                tp.getKhachHang().getTenKhachHang(),
                tp.getPhong().getSoPhong(),
                cp.getSoNgay(),
                hd.getNgayLapHoaDon(),
                cp.getGiaPhong().multiply(BigDecimal.valueOf(cp.getSoNgay())),
                cp.getTienDichVu(),
                hd.getTongTien());
    }

    public void xoa(String maHoaDon) {
        HoaDon hd = repo.findById(maHoaDon).orElseThrow(() ->
                new ResourceNotFoundException("Không tìm thấy hóa đơn " + maHoaDon));
        repo.delete(hd);
    }

    public TongTienResponse tinhTongTien(String maThue) {
        BigDecimal tienPhong = repo.tinhTienPhong(maThue);
        if (tienPhong == null) {
            throw new ResourceNotFoundException("Không tìm thấy phiếu thuê " + maThue);
        }
        BigDecimal tienDichVu = repo.tinhTienDichVu(maThue);
        return new TongTienResponse(maThue, tienPhong, tienDichVu, tienPhong.add(tienDichVu));
    }

    public List<SuDungDichVuListResponse> layDichVuTheoThue(String maThue) {
        return sddvRepo.findByThuePhong_MaThueOrderByNgaySuDungAsc(maThue).stream()
                .map(SuDungDichVuListResponse::fromEntity)
                .toList();
    }

    @Transactional
    public HoaDonListResponse them(HoaDonRequest req) {
        if (req.maThue() == null || req.maThue().isBlank()) {
            throw new BusinessException("Vui lòng chọn phiếu thuê");
        }
        String maThue = req.maThue().trim();

        // Tự tính tổng tiền = tiền phòng + tiền dịch vụ (báo 404 nếu không có phiếu thuê)
        TongTienResponse tien = tinhTongTien(maThue);

        if (repo.demHoaDonCuaPhieuThue(maThue) > 0) {
            throw new BusinessException("Phiếu thuê " + maThue + " đã có hóa đơn");
        }

        List<SuDungDichVu> dsDichVu = sddvRepo.findByThuePhong_MaThueOrderByNgaySuDungAsc(maThue);
        if (dsDichVu.isEmpty()) {
            throw new BusinessException("Phiếu thuê " + maThue + " chưa sử dụng dịch vụ nào, chưa thể lập hóa đơn");
        }

        LocalDate ngayTra = dsDichVu.get(0).getThuePhong().getNgayTra();
        if (req.ngayLapHoaDon() != null && !req.ngayLapHoaDon().equals(ngayTra)) {
            throw new BusinessException("Ngày lập hóa đơn phải trùng với ngày trả phòng (" + ngayTra + ")");
        }

        HoaDon hd = HoaDon.builder()
                .maHoaDon(taoMaTuDong())
                .suDungDichVu(dsDichVu.get(0))
                .ngayLapHoaDon(ngayTra)
                .tongTien(tien.tongTien())
                .build();
        return toListResponse(repo.save(hd));
    }

    private String taoMaTuDong() {
        Long max = repo.layMaSoLonNhat();
        long next = (max == null ? 0 : max) + 1;
        String ma = String.format("HD%02d", next);
        while (repo.existsById(ma)) {
            next++;
            ma = String.format("HD%02d", next);
        }
        return ma;
    }
}