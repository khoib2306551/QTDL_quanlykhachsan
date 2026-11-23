package com.khachsan.quanlykhachsan.entity.invoice;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "SuDungDichVu")
@Getter
@Setter
public class ServiceUsage {
    @Id
    @Column(name = "MaSDDV")
    private String maSddv;

    @Column(name = "MaThue")
    private String maThue;

    @Column(name = "MaDichVu")
    private String maDichVu;

    @Column(name = "SoLuong")
    private int soLuong;

    @Column(name = "NgaySuDung")
    private LocalDate ngaySuDung;
}