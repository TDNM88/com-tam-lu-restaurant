-- Enable RLS (Row Level Security)
ALTER TABLE IF EXISTS menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tables ENABLE ROW LEVEL SECURITY;

-- Create tables
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  short_name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image TEXT,
  category VARCHAR(50) NOT NULL,
  prep_time VARCHAR(20) DEFAULT '10-15 phút',
  rating DECIMAL(2,1) DEFAULT 4.5,
  is_popular BOOLEAN DEFAULT FALSE,
  is_free BOOLEAN DEFAULT FALSE,
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tables (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number VARCHAR(10) UNIQUE NOT NULL,
  qr_code_url TEXT,
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved')),
  capacity INTEGER DEFAULT 4,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_number VARCHAR(10) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
  notes TEXT,
  order_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  special_requests TEXT
);

-- Insert sample data
INSERT INTO categories (name, description, display_order) VALUES
('Combo Cơm Tấm', 'Các combo cơm tấm đặc trưng phục vụ trưa & tối', 1),
('Món Thịt Nướng Lu', 'Món thịt chính nướng bằng lu đất truyền thống', 2),
('Topping & Món Kèm', 'Các món kèm và topping gọi thêm', 3),
('Canh & Món Kèm', 'Canh nhà nấu và món kèm đặc biệt', 4),
('Nước Uống', 'Nước uống giải khát tươi mát', 5);

INSERT INTO menu_items (id, name, short_name, description, price, category, prep_time, rating, is_popular, is_free) VALUES
('combo1', 'Cơm Tấm Lu Sườn Đặc Biệt', 'Sườn Đặc Biệt', 'Sườn cọng nướng lu, trứng ốp, bì, chả - Đặc sản nhà Lu', 68000, 'combo', '15-20 phút', 4.9, TRUE, FALSE),
('combo2', 'Cơm Tấm Lu Gà Mật Ong', 'Gà Mật Ong', 'Đùi gà nướng lu mật ong, bì, trứng - Thơm ngon đậm đà', 62000, 'combo', '18-22 phút', 4.8, TRUE, FALSE),
('combo3', 'Cơm Tấm Lu Ba Rọi Nướng', 'Ba Rọi Nướng', 'Ba rọi nướng xả ớt, trứng kho - Vị cay nhẹ đặc trưng', 58000, 'combo', '15-18 phút', 4.7, FALSE, FALSE),
('combo4', 'Cơm Tấm Lu Truyền Thống', 'Truyền Thống', 'Sườn miếng, bì, trứng, chả - Combo truyền thống đậm chất Lu', 55000, 'combo', '12-15 phút', 4.6, FALSE, FALSE),
('combo5', 'Combo Ăn Nhẹ Buổi Trưa', 'Ăn Nhẹ', 'Lạp xưởng + trứng ốp + cơm - Gọn nhẹ, tiện lợi', 45000, 'combo', '8-12 phút', 4.5, FALSE, FALSE);

INSERT INTO tables (table_number, capacity) VALUES
('1', 4), ('2', 4), ('3', 6), ('4', 4), ('5', 2),
('6', 4), ('7', 6), ('8', 4), ('9', 4), ('10', 8);

-- Create RLS policies
CREATE POLICY "Allow public read access to menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read access to orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert access to order_items" ON order_items FOR INSERT WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_number);
CREATE INDEX IF NOT EXISTS idx_orders_time ON orders(order_time);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
