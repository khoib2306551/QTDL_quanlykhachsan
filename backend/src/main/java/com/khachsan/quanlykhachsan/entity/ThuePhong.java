package com.khachsan.quanlykhachsan.entity;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "ThuePhong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThuePhong {

    @Id
    @Column(name = "MaThue", length = 10, nullable = false)
    private String maThue;

    @ManyToOne
    @JoinColumn(name = "MaKhachHang", nullable = false)
    private KhachHang khachHang;

    @ManyToOne
    @JoinColumn(name = "MaPhong", nullable = false)
    private Phong phong;

    @Column(name = "NgayThue", nullable = false)
    private LocalDate ngayThue;

    @Column(name = "NgayNhan", nullable = false)
    private LocalDate ngayNhan;

    @Column(name = "NgayTra", nullable = false)
    private LocalDate ngayTra;

    @Builder.Default
    @Column(name = "TrangThai", length = 50, nullable = false)
    private String trangThai = "Đã đặt";
}