DROP DATABASE IF EXISTS quan_ly_khach_san;
CREATE DATABASE quan_ly_khach_san CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quan_ly_khach_san;

SET GLOBAL log_bin_trust_function_creators = 1;

CREATE TABLE LoaiPhong (
    MaLoai VARCHAR(10) PRIMARY KEY,
    TenLoai VARCHAR(100) NOT NULL,
    GiaPhong DECIMAL(15, 2) NOT NULL CHECK (GiaPhong >= 0)
);

CREATE TABLE Phong (
    MaPhong VARCHAR(10) PRIMARY KEY,
    MaLoai VARCHAR(10) NOT NULL,
    SoPhong VARCHAR(20) NOT NULL UNIQUE,
    TrangThai VARCHAR(50) NOT NULL DEFAULT 'Trống',
    CONSTRAINT chk_trangthai_phong CHECK (TrangThai IN ('Trống', 'Đang sử dụng')),
    CONSTRAINT fk_phong_loaiphong FOREIGN KEY (MaLoai)
        REFERENCES LoaiPhong(MaLoai) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE NhanVien (
    MaNhanVien VARCHAR(10) PRIMARY KEY,
    HoTen VARCHAR(100) NOT NULL,
    NgaySinh DATE,
    SoDienThoai VARCHAR(15),
    TaiKhoan VARCHAR(50) UNIQUE,
    MatKhau VARCHAR(255)
);

CREATE TABLE KhachHang (
    MaKhachHang VARCHAR(10) PRIMARY KEY,
    TenKhachHang VARCHAR(100) NOT NULL,
    DiaChi VARCHAR(255),
    SoDienThoai VARCHAR(15)
);

CREATE TABLE DichVu (
    MaDichVu VARCHAR(10) PRIMARY KEY,
    TenDichVu VARCHAR(100) NOT NULL,
    GiaDichVu DECIMAL(15, 2) NOT NULL CHECK (GiaDichVu >= 0)
);

CREATE TABLE ThuePhong (
    MaThue VARCHAR(10) PRIMARY KEY,
    MaKhachHang VARCHAR(10) NOT NULL,
    MaPhong VARCHAR(10) NOT NULL,
    NgayThue DATE NOT NULL,
    NgayNhan DATE NOT NULL,
    NgayTra DATE NOT NULL,
    TrangThai VARCHAR(50) NOT NULL DEFAULT 'Đã đặt',
    CONSTRAINT chk_trangthai_thue CHECK (TrangThai IN ('Đã đặt', 'Đang ở', 'Đã trả')),
    CONSTRAINT chk_ngay_hop_le CHECK (NgayTra >= NgayNhan),
    CONSTRAINT fk_thuephong_khachhang FOREIGN KEY (MaKhachHang)
        REFERENCES KhachHang(MaKhachHang) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_thuephong_phong FOREIGN KEY (MaPhong)
        REFERENCES Phong(MaPhong) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE SuDungDichVu (
    MaSDDV VARCHAR(10) PRIMARY KEY,
    MaThue VARCHAR(10) NOT NULL,
    MaDichVu VARCHAR(10) NOT NULL,
    SoLuong INT NOT NULL DEFAULT 1 CHECK (SoLuong > 0),
    NgaySuDung DATE NOT NULL,
    CONSTRAINT fk_sddv_thuephong FOREIGN KEY (MaThue)
        REFERENCES ThuePhong(MaThue) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_sddv_dichvu FOREIGN KEY (MaDichVu)
        REFERENCES DichVu(MaDichVu) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE HoaDon (
    MaHoaDon VARCHAR(10) PRIMARY KEY,
    MaSDDV VARCHAR(10),
    MaNhanVien VARCHAR(10) NOT NULL,
    NgayLapHoaDon DATE NOT NULL,
    TongTien DECIMAL(15, 2) NOT NULL DEFAULT 0 CHECK (TongTien >= 0),
    CONSTRAINT fk_hoadon_sddv FOREIGN KEY (MaSDDV)
        REFERENCES SuDungDichVu(MaSDDV) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_hoadon_nhanvien FOREIGN KEY (MaNhanVien)
        REFERENCES NhanVien(MaNhanVien) ON UPDATE CASCADE ON DELETE RESTRICT
);

ALTER TABLE LoaiPhong ADD COLUMN MoTa VARCHAR(500) NULL;

DELIMITER $$

-- 1. FUNCTION: Tính tổng số ngày lưu trú dựa trên Ngày nhận và Ngày trả (Nếu nhận và trả trong cùng 1 ngày thì tính tối thiểu là 1 ngày)
CREATE FUNCTION fn_TinhSoNgayLuuTru(
    p_NgayNhan DATE,
    p_NgayTra DATE
)
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE v_SoNgay INT;
    IF p_NgayTra IS NULL OR p_NgayNhan IS NULL THEN
        RETURN 0;
    END IF;

    SET v_SoNgay = DATEDIFF(p_NgayTra, p_NgayNhan);
    IF v_SoNgay <= 0 THEN
        SET v_SoNgay = 1;
    END IF;

    RETURN v_SoNgay;
END$$

-- 2. TRIGGER: Tự động cập nhật trạng thái phòng trước khi thêm đơn đặt phòng mới
CREATE TRIGGER trg_CapNhatPhongTruocKhiDat
BEFORE INSERT ON ThuePhong
FOR EACH ROW
BEGIN
    -- Nếu đơn thuê mới ở trạng thái 'Đã đặt' hoặc 'Đang ở' thì chuyển phòng sang 'Đang sử dụng'
    IF NEW.TrangThai IN ('Đã đặt', 'Đang ở') THEN
        UPDATE Phong
        SET TrangThai = 'Đang sử dụng'
        WHERE MaPhong = NEW.MaPhong;
    END IF;
END$$

-- Trigger phụ trợ: Tự động trả trạng thái phòng về 'Trống' khi cập nhật phiếu thuê thành 'Đã trả'
CREATE TRIGGER trg_CapNhatPhongKhiTraPhong
AFTER UPDATE ON ThuePhong
FOR EACH ROW
BEGIN
    IF NEW.TrangThai = 'Đã trả' THEN
        UPDATE Phong
        SET TrangThai = 'Trống'
        WHERE MaPhong = NEW.MaPhong;
    ELSEIF NEW.TrangThai IN ('Đã đặt', 'Đang ở') THEN
        UPDATE Phong
        SET TrangThai = 'Đang sử dụng'
        WHERE MaPhong = NEW.MaPhong;
    END IF;
END$$

-- 3. STORED PROCEDURE: Danh sách khách đặt phòng theo khoảng thời gian (Truyền vào tham số Ngày nhận - Ngày trả, hiển thị danh sách phòng & khách)
CREATE PROCEDURE sp_DanhSachDatPhongTheoThoiGian(
    IN p_NgayBatDau DATE,
    IN p_NgayKetThuc DATE
)
BEGIN
    SELECT
        tp.MaThue,
        kh.MaKhachHang,
        kh.TenKhachHang,
        kh.SoDienThoai,
        p.MaPhong,
        p.SoPhong,
        lp.TenLoai,
        lp.GiaPhong,
        tp.NgayThue,
        tp.NgayNhan,
        tp.NgayTra,
        fn_TinhSoNgayLuuTru(tp.NgayNhan, tp.NgayTra) AS SoNgayLuuTru,
        tp.TrangThai AS TrangThaiThue
    FROM ThuePhong tp
    INNER JOIN KhachHang kh ON tp.MaKhachHang = kh.MaKhachHang
    INNER JOIN Phong p ON tp.MaPhong = p.MaPhong
    INNER JOIN LoaiPhong lp ON p.MaLoai = lp.MaLoai
    WHERE tp.NgayNhan >= p_NgayBatDau
      AND tp.NgayTra <= p_NgayKetThuc
    ORDER BY tp.NgayNhan ASC;
END$$

-- 4. STORED PROCEDURE: Thống kê doanh thu theo Ngày, Tuần, Tháng, Quý, Năm
DROP PROCEDURE IF EXISTS sp_ThongKeDoanhThu$$

CREATE PROCEDURE sp_ThongKeDoanhThu(
    IN p_KieuThongKe VARCHAR(10),
    IN p_Nam INT
)
BEGIN

    IF UPPER(p_KieuThongKe) = 'NGAY' THEN

        SELECT
            NgayLapHoaDon AS MocThoiGian,
            COUNT(MaHoaDon) AS SoLuongHoaDon,
            MAX(TongTien) AS HoaDonCaoNhat,
            MIN(TongTien) AS HoaDonThapNhat,
            ROUND(AVG(TongTien), 2) AS TrungBinhHoaDon,
            SUM(TongTien) AS TongDoanhThu
        FROM HoaDon
        WHERE YEAR(NgayLapHoaDon) = p_Nam
        GROUP BY NgayLapHoaDon
        ORDER BY NgayLapHoaDon DESC;

    ELSEIF UPPER(p_KieuThongKe) = 'TUAN' THEN

        SELECT
            YEAR(NgayLapHoaDon) AS Nam,
            WEEK(NgayLapHoaDon, 1) AS TuanThu,
            COUNT(MaHoaDon) AS SoLuongHoaDon,
            MAX(TongTien) AS HoaDonCaoNhat,
            MIN(TongTien) AS HoaDonThapNhat,
            ROUND(AVG(TongTien), 2) AS TrungBinhHoaDon,
            SUM(TongTien) AS TongDoanhThu
        FROM HoaDon
        WHERE YEAR(NgayLapHoaDon) = p_Nam
        GROUP BY
            YEAR(NgayLapHoaDon),
            WEEK(NgayLapHoaDon, 1)
        ORDER BY TuanThu ASC;

    ELSEIF UPPER(p_KieuThongKe) = 'THANG' THEN

        SELECT
            YEAR(NgayLapHoaDon) AS Nam,
            MONTH(NgayLapHoaDon) AS Thang,
            COUNT(MaHoaDon) AS SoLuongHoaDon,
            MAX(TongTien) AS HoaDonCaoNhat,
            MIN(TongTien) AS HoaDonThapNhat,
            ROUND(AVG(TongTien), 2) AS TrungBinhHoaDon,
            SUM(TongTien) AS TongDoanhThu
        FROM HoaDon
        WHERE YEAR(NgayLapHoaDon) = p_Nam
        GROUP BY
            YEAR(NgayLapHoaDon),
            MONTH(NgayLapHoaDon)
        ORDER BY Thang ASC;

    ELSEIF UPPER(p_KieuThongKe) = 'QUY' THEN

        SELECT
            YEAR(NgayLapHoaDon) AS Nam,
            QUARTER(NgayLapHoaDon) AS Quy,
            COUNT(MaHoaDon) AS SoLuongHoaDon,
            MAX(TongTien) AS HoaDonCaoNhat,
            MIN(TongTien) AS HoaDonThapNhat,
            ROUND(AVG(TongTien), 2) AS TrungBinhHoaDon,
            SUM(TongTien) AS TongDoanhThu
        FROM HoaDon
        WHERE YEAR(NgayLapHoaDon) = p_Nam
        GROUP BY
            YEAR(NgayLapHoaDon),
            QUARTER(NgayLapHoaDon)
        ORDER BY Quy ASC;

    ELSEIF UPPER(p_KieuThongKe) = 'NAM' THEN

        SELECT
            YEAR(NgayLapHoaDon) AS Nam,
            COUNT(MaHoaDon) AS SoLuongHoaDon,
            MAX(TongTien) AS HoaDonCaoNhat,
            MIN(TongTien) AS HoaDonThapNhat,
            ROUND(AVG(TongTien), 2) AS TrungBinhHoaDon,
            SUM(TongTien) AS TongDoanhThu
        FROM HoaDon
        WHERE YEAR(NgayLapHoaDon) = p_Nam
        GROUP BY YEAR(NgayLapHoaDon)
        ORDER BY Nam ASC;

    -- Kiểm tra kiểu thống kê không hợp lệ
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT =
        'Kieu thong ke khong hop le: NGAY, TUAN, THANG, QUY, NAM';

    END IF;

END$$

DELIMITER ;

INSERT INTO LoaiPhong (MaLoai, TenLoai, GiaPhong) VALUES
('LP01', 'Phòng Đơn Tiêu Chuẩn (Standard Single)', 350000),
('LP02', 'Phòng Đôi Cao Cấp (Deluxe Double)', 600000),
('LP03', 'Phòng Gia Đình (Family Suite)', 950000),
('LP04', 'Phòng Tổng Thống (VIP President)', 1800000);

INSERT INTO Phong (MaPhong, MaLoai, SoPhong, TrangThai) VALUES
('P101', 'LP01', '101', 'Trống'),
('P102', 'LP01', '102', 'Trống'),
('P201', 'LP02', '201', 'Trống'),
('P202', 'LP02', '202', 'Trống'),
('P301', 'LP03', '301', 'Trống'),
('P401', 'LP04', '401', 'Trống');

INSERT INTO NhanVien (MaNhanVien, HoTen, NgaySinh, SoDienThoai, TaiKhoan, MatKhau) VALUES
('NV01', 'Nguyễn Đăng Khôi', '2005-05-15', '0901234567', 'admin', '123456'),
('NV02', 'Huỳnh Chí Nghĩa', '2005-08-20', '0912345678', 'nghiahc', '123456'),
('NV03', 'Trần Thị Mỹ Giang', '2005-11-10', '0923456789', 'giangtt', '123456'),
('NV04', 'Lê Phương Bách', '2004-03-25', '0934567890', 'bachlp', '123456');

INSERT INTO KhachHang (MaKhachHang, TenKhachHang, DiaChi, SoDienThoai) VALUES
('KH01', 'Phạm Minh Tuấn', 'Ninh Kiều, Cần Thơ', '0987654321'),
('KH02', 'Lê Hoàng Bảo Trân', 'Quận 1, TP. Hồ Chí Minh', '0976543210'),
('KH03', 'Đặng Quốc Huy', 'Đà Lạt, Lâm Đồng', '0965432109'),
('KH04', 'Võ Thị Tuyết Mai', 'Hoàn Kiếm, Hà Nội', '0954321098');

INSERT INTO DichVu (MaDichVu, TenDichVu, GiaDichVu) VALUES
('DV01', 'Buffet sáng', 150000),
('DV02', 'Giặt ủi quần áo (1kg)', 50000),
('DV03', 'Nước suối & Mini Bar', 80000),
('DV04', 'Đưa đón sân bay', 300000),
('DV05', 'Spa & Massage thư giãn', 400000);

INSERT INTO ThuePhong (MaThue, MaKhachHang, MaPhong, NgayThue, NgayNhan, NgayTra, TrangThai) VALUES
('TP01', 'KH01', 'P101', '2026-10-01', '2026-10-02', '2026-10-05', 'Đã trả'),
('TP02', 'KH02', 'P201', '2026-11-01', '2026-11-02', '2026-11-06', 'Đang ở'),
('TP03', 'KH03', 'P301', '2026-11-10', '2026-11-12', '2026-11-15', 'Đang ở'),
('TP04', 'KH04', 'P401', '2026-11-12', '2026-11-14', '2026-11-18', 'Đã đặt');

INSERT INTO SuDungDichVu (MaSDDV, MaThue, MaDichVu, SoLuong, NgaySuDung) VALUES
('SD01', 'TP01', 'DV01', 2, '2026-10-03'),
('SD02', 'TP01', 'DV02', 3, '2026-10-04'),
('SD03', 'TP02', 'DV01', 4, '2026-11-03'),
('SD04', 'TP03', 'DV04', 1, '2026-11-12'),
('SD05', 'TP04', 'DV05', 2, '2026-11-14');

INSERT INTO HoaDon (MaHoaDon, MaSDDV, MaNhanVien, NgayLapHoaDon, TongTien) VALUES
('HD01', 'SD01', 'NV01', '2026-10-05', 1500000),
('HD02', 'SD03', 'NV01', '2026-11-06', 3000000),
('HD03', 'SD04', 'NV02', '2026-11-15', 3150000),
('HD04', 'SD05', 'NV02', '2026-11-18', 8000000);

-- Gán mặc định NV01 nếu có hóa đơn cũ chưa có người lập trước khi bật trigger
UPDATE HoaDon SET MaNhanVien = 'NV01' WHERE MaNhanVien IS NULL;

-- Trigger: không cho thêm dịch vụ vào phiếu thuê đã có hóa đơn
DROP TRIGGER IF EXISTS trg_ChanThemSDDVKhiDaCoHoaDon;

DELIMITER $$
CREATE TRIGGER trg_ChanThemSDDVKhiDaCoHoaDon
BEFORE INSERT ON SuDungDichVu
FOR EACH ROW
BEGIN
    IF EXISTS (SELECT 1
                 FROM HoaDon hd
                 JOIN SuDungDichVu sd ON sd.MaSDDV = hd.MaSDDV
                WHERE sd.MaThue = NEW.MaThue) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Phieu thue da co hoa don, khong the them dich vu';
    END IF;
END$$
DELIMITER ;

-- Kiểm tra Trigger: Xem phòng P201, P301, P401 đã tự động đổi sang 'Đang sử dụng' chưa
SELECT * FROM Phong;

-- Kiểm tra Function: Tính số ngày lưu trú của các phiếu thuê phòng
SELECT MaThue, NgayNhan, NgayTra, fn_TinhSoNgayLuuTru(NgayNhan, NgayTra) AS TongSoNgay
FROM ThuePhong;

-- Kiểm tra Stored Procedure: Tìm khách đặt phòng trong tháng 11/2026
CALL sp_DanhSachDatPhongTheoThoiGian('2026-11-01', '2026-11-30');

-- Kiểm tra Thống kê doanh thu theo Ngày, Tuần, Tháng trong năm 2026
CALL sp_ThongKeDoanhThu('NGAY', 2026);
CALL sp_ThongKeDoanhThu('TUAN', 2026);
CALL sp_ThongKeDoanhThu('THANG', 2026);
CALL sp_ThongKeDoanhThu('QUY', 2026);
CALL sp_ThongKeDoanhThu('NAM', 2026);
