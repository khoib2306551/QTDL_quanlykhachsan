package com.khachsan.quanlykhachsan.service;

import com.khachsan.quanlykhachsan.entity.NhanVien;
import com.khachsan.quanlykhachsan.exception.ResourceNotFoundException;
import com.khachsan.quanlykhachsan.repository.NhanVienRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

<<<<<<< Updated upstream
=======
import java.time.LocalDate;
import java.util.Optional;

>>>>>>> Stashed changes
@Service
@RequiredArgsConstructor
public class NhanVienService {
    private final NhanVienRepository nhanVienRepository;
    public NhanVien getByTaiKhoan(String tk){
        return this.nhanVienRepository.getByTaiKhoan(tk).orElseThrow(()-> new ResourceNotFoundException("Not found nhan vien with tk "+tk));
    }
<<<<<<< Updated upstream
=======

    public Optional<NhanVien> getForAuth (String tk){
        return this.nhanVienRepository.getByTaiKhoan(tk);
    }


    public NhanVien save(NhanVien nhanVien){
        return this.nhanVienRepository.save(nhanVien);
    }

    public boolean existsByTaiKhoan(String maNhanVien){
        return this.nhanVienRepository.existsByTaiKhoan((maNhanVien));
    }
>>>>>>> Stashed changes
}
