package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.dto.PageResponse;
import com.khachsan.quanlykhachsan.dto.request.NhanVienRequest;
import com.khachsan.quanlykhachsan.dto.response.UserInfo;
import com.khachsan.quanlykhachsan.entity.NhanVien;
import com.khachsan.quanlykhachsan.exception.AuthException;
import com.khachsan.quanlykhachsan.exception.ResourceNotFoundException;
import com.khachsan.quanlykhachsan.repository.NhanVienRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NhanVienService {
    private final NhanVienRepository nhanVienRepository;
    private final PasswordEncoder passwordEncoder;
    public NhanVien getByTaiKhoan(String tk){
        return this.nhanVienRepository.getByTaiKhoan(tk).orElseThrow(()-> new ResourceNotFoundException("Not found nhan vien with tk "+tk));
    }

    public Optional<NhanVien> getForAuth (String tk){
        return this.nhanVienRepository.getByTaiKhoan(tk);
    }


    public NhanVien save(NhanVien nhanVien){
        return this.nhanVienRepository.save(nhanVien);
    }

    public boolean existsByTaiKhoan(String maNhanVien){
        return this.nhanVienRepository.existsByTaiKhoan((maNhanVien));
    }

    public PageResponse<UserInfo> getPageNhanVien(int page, int size, String keyword) {
        int pageIndex = Math.max(page - 1, 0);
        Pageable pageable = PageRequest.of(pageIndex, size, Sort.by("maNhanVien").ascending());

        String cleanKeyword = (keyword != null) ? keyword.trim() : null;
        Page<NhanVien> nhanVienPage = this.nhanVienRepository.searchNhanVien(cleanKeyword, pageable);

        Page<UserInfo> dtoPage = nhanVienPage.map(UserInfo::fromEntity);
        return PageResponse.from(dtoPage);
    }

    public NhanVien createNhanVien(String hoTen, String taiKhoan, String rawMatKhau, LocalDate ngaySinh, String soDienThoai ){

        if(this.nhanVienRepository.existsByTaiKhoan(taiKhoan)){
            throw new AuthException("Tên đăng nhập đã tồn tại ");
        }
        String shortUuid = UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase();

        NhanVien nhanVien = NhanVien.builder()
                .maNhanVien(shortUuid)
                .taiKhoan(taiKhoan)
                .matKhau(passwordEncoder.encode(rawMatKhau))
                .hoTen(hoTen)
                .ngaySinh(ngaySinh)
                .soDienThoai(soDienThoai)
                .build();

        if(ngaySinh!=null){
            nhanVien.setNgaySinh(ngaySinh);
        }
        if(soDienThoai!=null){
            nhanVien.setSoDienThoai(soDienThoai);
        }
        NhanVien saved = this.nhanVienRepository.save(nhanVien);
        return saved;
    }

    public UserInfo createNhanVien(NhanVienRequest req) {
        NhanVien saved = createNhanVien(
                req.getHoTen(), req.getTaiKhoan(), req.getMatKhau(), req.getNgaySinh(), req.getSoDienThoai()
        );
        return UserInfo.fromEntity(saved);
    }

    public UserInfo updateNhanVien(String maNhanVien, NhanVienRequest request) {
        NhanVien nv = this.nhanVienRepository.findById(maNhanVien)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với mã: " + maNhanVien));

        if (request.getHoTen() != null && !request.getHoTen().isBlank()) {
            nv.setHoTen(request.getHoTen().trim());
        }

        if (request.getTaiKhoan() != null && !request.getTaiKhoan().isBlank()) {
            String newTaiKhoan = request.getTaiKhoan().trim();
            if (!newTaiKhoan.equals(nv.getTaiKhoan()) && this.nhanVienRepository.existsByTaiKhoan(newTaiKhoan)) {
                throw new AuthException("Tài khoản đã tồn tại");
            }
            nv.setTaiKhoan(newTaiKhoan);
        }

        if (request.getMatKhau() != null && !request.getMatKhau().isBlank()) {
            if (request.getMatKhau().length() < 8) {
                throw new AuthException("Mật khẩu mới phải có ít nhất 8 ký tự");
            }
            nv.setMatKhau(this.passwordEncoder.encode(request.getMatKhau()));
        }

        if (request.getNgaySinh() != null) {
            nv.setNgaySinh(request.getNgaySinh());
        }

        if (request.getSoDienThoai() != null) {
            String sdt = request.getSoDienThoai().trim();
            nv.setSoDienThoai(sdt.isEmpty() ? null : sdt);
        }

        NhanVien updated = this.nhanVienRepository.save(nv);
        return UserInfo.fromEntity(updated);
    }

    public void deleteNhanVien(String maNhanVien,String ownerID) {
        NhanVien nv = this.nhanVienRepository.findById(maNhanVien)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với mã: " + maNhanVien));

        if (nv.getMaNhanVien().equals(ownerID)) {
                throw new AuthException("Không thể tự xóa tài khoản đang đăng nhập");
        }

        try {
            this.nhanVienRepository.delete(nv);
            this.nhanVienRepository.flush();
        } catch (DataIntegrityViolationException e) {
            throw new AuthException("Không thể xóa nhân viên này vì đã phát sinh dữ liệu liên quan (hóa đơn, đặt phòng...)");
        }
    }

    public UserInfo getNhanVienDetail(String maNhanVien){
        NhanVien nv = this.nhanVienRepository.findById(maNhanVien)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy nhân viên với mã: " + maNhanVien));

        return UserInfo.fromEntity(nv);
    }
}
