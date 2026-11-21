package com.khachsan.quanlykhachsan.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "NhanVien")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhanVien {

    @Id
    @Column(name = "MaNhanVien", length = 10, nullable = false)
    private String maNhanVien;

    @Column(name = "HoTen", length = 100, nullable = false)
    private String hoTen;

    @Column(name = "NgaySinh")
    private LocalDate ngaySinh;

    @Column(name = "SoDienThoai", length = 15)
    private String soDienThoai;

    @Column(name = "TaiKhoan", length = 50, unique = true)
    private String taiKhoan;

    @Column(name = "MatKhau", length = 255)
    private String matKhau;
}