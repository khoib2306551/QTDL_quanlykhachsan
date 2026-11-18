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
        if (kh.getMaKhachHang() == null || kh.getMaKhachHang().trim().isEmpty()) {
            throw new IllegalArgumentException("Mã khách hàng không được để trống");
        }
        if (khachHangRepository.existsById(kh.getMaKhachHang().trim())) {
            throw new IllegalArgumentException("Mã khách hàng " + kh.getMaKhachHang() + " đã tồn tại");
        }
        kh.setMaKhachHang(kh.getMaKhachHang().trim());
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
}