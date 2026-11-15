package com.khachsan.quanlykhachsan.entity;


import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "DichVu")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DichVu {

    @Id
    @Column(name = "MaDichVu", length = 10, nullable = false)
    private String maDichVu;

    @Column(name = "TenDichVu", length = 100, nullable = false)
    private String tenDichVu;

    @Column(name = "GiaDichVu", precision = 15, scale = 2, nullable = false)
    private BigDecimal giaDichVu;
}