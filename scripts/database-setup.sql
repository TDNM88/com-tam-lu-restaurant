-- Tạo cơ sở dữ liệu cho nhà hàng Cơm Tấm LU
CREATE DATABASE IF NOT EXISTS com_tam_lu_restaurant;
USE com_tam_lu_restaurant;

-- Bảng Users - Quản lý tài khoản nhân viên
CREATE TABLE Users (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    FullName VARCHAR(100) NOT NULL,
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('Admin', 'Staff', 'Kitchen') DEFAULT 'Staff',
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng Tables - Quản lý bàn ăn
CREATE TABLE Tables (
    TableID INT PRIMARY KEY AUTO_INCREMENT,
    TableNumber VARCHAR(10) UNIQUE NOT NULL,
    QRCodeURL VARCHAR(255),
    Status ENUM('Available', 'Occupied', 'Reserved') DEFAULT 'Available',
    Capacity INT DEFAULT 4,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng Categories - Phân loại món ăn
CREATE TABLE Categories (
    CategoryID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    DisplayOrder INT DEFAULT 0,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bảng MenuItems - Thực đơn
CREATE TABLE MenuItems (
    ItemID VARCHAR(50) PRIMARY KEY,
    Name VARCHAR(200) NOT NULL,
    Description TEXT,
    Price DECIMAL(10,2) NOT NULL,
    CategoryID INT,
    PrepTime VARCHAR(20),
    Rating DECIMAL(2,1) DEFAULT 0.0,
    IsPopular BOOLEAN DEFAULT FALSE,
    IsAvailable BOOLEAN DEFAULT TRUE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID)
);

-- Bảng Orders - Đơn hàng
CREATE TABLE Orders (
    OrderID INT PRIMARY KEY AUTO_INCREMENT,
    TableID INT,
    OrderTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(10,2) NOT NULL,
    Status ENUM('Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled') DEFAULT 'Pending',
    Notes TEXT,
    CompletedAt TIMESTAMP NULL,
    FOREIGN KEY (TableID) REFERENCES Tables(TableID)
);

-- Bảng OrderDetails - Chi tiết đơn hàng
CREATE TABLE OrderDetails (
    OrderDetailID INT PRIMARY KEY AUTO_INCREMENT,
    OrderID INT,
    ItemID VARCHAR(50),
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    Subtotal DECIMAL(10,2) NOT NULL,
    SpecialRequests TEXT,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ItemID) REFERENCES MenuItems(ItemID)
);

-- Bảng OrderStatusHistory - Lịch sử trạng thái đơn hàng
CREATE TABLE OrderStatusHistory (
    HistoryID INT PRIMARY KEY AUTO_INCREMENT,
    OrderID INT,
    Status VARCHAR(50) NOT NULL,
    ChangedBy INT,
    ChangedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Notes TEXT,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ChangedBy) REFERENCES Users(UserID)
);

-- Thêm dữ liệu mẫu
INSERT INTO Categories (Name, Description, DisplayOrder) VALUES
('Combo Cơm Tấm', 'Các combo cơm tấm đặc trưng phục vụ trưa & tối', 1),
('Món Thịt Nướng Lu', 'Món thịt chính nướng bằng lu đất truyền thống', 2),
('Topping & Món Kèm', 'Các món kèm và topping gọi thêm', 3),
('Canh & Món Kèm', 'Canh nhà nấu và món kèm đặc biệt', 4),
('Nước Uống', 'Nước uống giải khát tươi mát', 5);

INSERT INTO MenuItems (ItemID, Name, Description, Price, CategoryID, PrepTime, Rating, IsPopular) VALUES
-- Combo Cơm Tấm Đặc Trưng
('combo1', 'Cơm Tấm Lu Sườn Đặc Biệt', 'Sườn cọng nướng lu, trứng ốp, bì, chả - Đặc sản nhà Lu', 68000, 1, '15-20 phút', 4.9, TRUE),
('combo2', 'Cơm Tấm Lu Gà Mật Ong', 'Đùi gà nướng lu mật ong, bì, trứng - Thơm ngon đậm đà', 62000, 1, '18-22 phút', 4.8, TRUE),
('combo3', 'Cơm Tấm Lu Ba Rọi Nướng', 'Ba rọi nướng xả ớt, trứng kho - Vị cay nhẹ đặc trưng', 58000, 1, '15-18 phút', 4.7, FALSE),
('combo4', 'Cơm Tấm Lu Truyền Thống', 'Sườn miếng, bì, trứng, chả - Combo truyền thống đậm chất Lu', 55000, 1, '12-15 phút', 4.6, FALSE),
('combo5', 'Combo Ăn Nhẹ Buổi Trưa', 'Lạp xưởng + trứng ốp + cơm - Gọn nhẹ, tiện lợi', 45000, 1, '8-12 phút', 4.5, FALSE),

-- Món Thịt Chính – Nướng Bằng Lu
('meat1', 'Sườn miếng nướng lu', 'Tẩm ướp 10 giờ, nướng bằng lu đất - Đặc sản nhà Lu', 38000, 2, '10-15 phút', 4.8, FALSE),
('meat2', 'Sườn cọng nướng lu', 'Cọng lớn, ướp mật ong - Thơm ngon, đậm đà', 45000, 2, '15-18 phút', 4.9, TRUE),
('meat3', 'Ba rọi nướng lu', 'Xả ớt thơm cay nhẹ - Vị đặc trưng khó quên', 40000, 2, '12-15 phút', 4.7, FALSE),
('meat4', 'Đùi gà nướng lu', 'Mật ong đậm đà, da giòn - Món yêu thích của trẻ em', 42000, 2, '18-20 phút', 4.8, FALSE),
('meat5', 'Lạp xưởng tươi', 'Hơi ngọt, áp chảo vừa tới - Đặc sản miền Nam', 30000, 2, '8-10 phút', 4.6, FALSE),

-- Món Kèm & Topping
('topping1', 'Trứng ốp la', 'Trứng gà tươi ốp la vàng ươm', 8000, 3, '3-5 phút', 4.5, FALSE),
('topping2', 'Trứng kho', 'Trứng kho đậm đà, thấm gia vị', 10000, 3, '5-7 phút', 4.6, FALSE),
('topping3', 'Bì thịt', 'Bì thịt truyền thống, giòn ngon', 12000, 3, 'Có sẵn', 4.7, FALSE),
('topping4', 'Chả trứng hấp', 'Chả trứng hấp mềm mịn, thơm ngon', 10000, 3, '5-8 phút', 4.5, FALSE),
('topping5', 'Chả cua', 'Chả cua đặc biệt, thơm ngon bổ dưỡng', 15000, 3, '8-10 phút', 4.8, FALSE),

-- Canh & Món Kèm Nhà Nấu
('soup1', 'Canh rong biển thịt bằm', 'Canh rong biển thịt bằm thanh mát, bổ dưỡng', 12000, 4, '10-12 phút', 4.6, FALSE),
('soup2', 'Canh bí đỏ đậu phộng', 'Canh bí đỏ đậu phộng ngọt thanh, bổ dưỡng', 10000, 4, '12-15 phút', 4.5, FALSE),
('free1', 'Dưa mắm Lu (tự làm)', 'Dưa mắm tự làm đặc trưng nhà Lu - MIỄN PHÍ', 0, 4, 'Có sẵn', 4.7, TRUE),
('free2', 'Nước mắm tỏi ớt Lu', 'Nước mắm tỏi ớt pha chế đặc biệt - MIỄN PHÍ', 0, 4, 'Có sẵn', 4.8, TRUE),

-- Nước Uống Giải Khát
('drink1', 'Trà tắc Lu', 'Trà tắc đặc chế nhà Lu, tươi mát', 12000, 5, '3-5 phút', 4.6, FALSE),
('drink2', 'Sâm bí đao nhà nấu', 'Sâm bí đao nhà nấu thanh mát, giải nhiệt', 10000, 5, 'Có sẵn', 4.5, FALSE),
('drink3', 'Nước suối Lavie', 'Nước suối Lavie chai 500ml', 8000, 5, 'Có sẵn', 4.3, FALSE),
('drink4', 'Trà đào cam sả', 'Trà đào cam sả thơm ngon, sảng khoái', 15000, 5, '5-7 phút', 4.7, TRUE);

INSERT INTO Tables (TableNumber, QRCodeURL, Capacity) VALUES
('1', 'https://example.com/qr/table1', 4),
('2', 'https://example.com/qr/table2', 4),
('3', 'https://example.com/qr/table3', 6),
('4', 'https://example.com/qr/table4', 4),
('5', 'https://example.com/qr/table5', 2),
('6', 'https://example.com/qr/table6', 4),
('7', 'https://example.com/qr/table7', 6),
('8', 'https://example.com/qr/table8', 4),
('9', 'https://example.com/qr/table9', 4),
('10', 'https://example.com/qr/table10', 8);

INSERT INTO Users (FullName, Username, Password, Role) VALUES
('Nguyễn Văn Admin', 'admin', '$2b$10$hashedpassword', 'Admin'),
('Trần Thị Nhân Viên', 'staff1', '$2b$10$hashedpassword', 'Staff'),
('Lê Văn Bếp', 'kitchen1', '$2b$10$hashedpassword', 'Kitchen');
