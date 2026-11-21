package com.khachsan.quanlykhachsan.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "Phong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Phong {

    @Id
    @Column(name = "MaPhong", length = 10, nullable = false)
    private String maPhong;

    @ManyToOne
    @JoinColumn(name = "MaLoai", nullable = false)
    private LoaiPhong loaiPhong;

    @Column(name = "SoPhong", length = 20, nullable = false, unique = true)
    private String soPhong;

    @Builder.Default
    @Column(name = "TrangThai", length = 50, nullable = false)
    private String trangThai = "Trống";
}