package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.entity.KhachHang;
import com.khachsan.quanlykhachsan.exception.ResourceNotFoundException;
import com.khachsan.quanlykhachsan.repository.KhachHangRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KhachHangService {

    private final KhachHangRepository khachHangRepository;

    public List<KhachHang> layDanhSach(String tuKhoa) {
        return khachHangRepository.timKiemKhachHang(tuKhoa);
    }

    @Transactional
    public KhachHang themKhachHang(KhachHang kh) {
        if (kh.getTenKhachHang() == null || kh.getTenKhachHang().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên khách hàng không được để trống");
        }

        String maKH = (kh.getMaKhachHang() == null || kh.getMaKhachHang().trim().isEmpty())
                ? taoMaKhachHangTuDong()
                : kh.getMaKhachHang().trim();

        if (khachHangRepository.existsById(maKH)) {
            throw new IllegalArgumentException("Mã khách hàng " + maKH + " đã tồn tại");
        }

        kh.setMaKhachHang(maKH);
        return khachHangRepository.save(kh);
    }

    @Transactional
    public KhachHang capNhatKhachHang(String maKH, KhachHang capNhat) {
        KhachHang hienTai = khachHangRepository.findById(maKH)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khách hàng có mã " + maKH));

        hienTai.setTenKhachHang(capNhat.getTenKhachHang());
        hienTai.setDiaChi(capNhat.getDiaChi());
        hienTai.setSoDienThoai(capNhat.getSoDienThoai());
        return khachHangRepository.save(hienTai);
    }

    @Transactional
    public void xoaKhachHang(String maKH) {
        if (!khachHangRepository.existsById(maKH)) {
            throw new ResourceNotFoundException("Không tìm thấy khách hàng có mã " + maKH);
        }
        khachHangRepository.deleteById(maKH);
    }

    private String taoMaKhachHangTuDong() {
        Long maxSo = khachHangRepository.layMaSoLonNhat();
        long nextSo = (maxSo == null ? 0 : maxSo) + 1;
        String maMoi = String.format("KH%02d", nextSo);
        while (khachHangRepository.existsById(maMoi)) {
            nextSo++;
            maMoi = String.format("KH%02d", nextSo);
        }
        return maMoi;
    }
}