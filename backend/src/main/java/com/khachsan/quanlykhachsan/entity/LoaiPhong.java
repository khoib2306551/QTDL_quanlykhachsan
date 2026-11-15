package com.khachsan.quanlykhachsan.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "LoaiPhong")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoaiPhong {

    @Id
    @Column(name = "MaLoai", length = 10, nullable = false)
    private String maLoai;

    @Column(name = "TenLoai", length = 100, nullable = false)
    private String tenLoai;

    @Column(name = "GiaPhong", precision = 15, scale = 2, nullable = false)
    private BigDecimal giaPhong;
}