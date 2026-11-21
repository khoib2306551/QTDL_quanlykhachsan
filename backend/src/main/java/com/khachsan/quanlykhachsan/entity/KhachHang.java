package com.khachsan.quanlykhachsan.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "KhachHang")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KhachHang {

    @Id
    @Column(name = "MaKhachHang", length = 10, nullable = false)
    private String maKhachHang;

    @Column(name = "TenKhachHang", length = 100, nullable = false)
    private String tenKhachHang;

    @Column(name = "DiaChi", length = 255)
    private String diaChi;

    @Column(name = "SoDienThoai", length = 15)
    private String soDienThoai;
}