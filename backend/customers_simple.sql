CREATE TABLE IF NOT EXISTS customers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  company VARCHAR(100) NOT NULL,
  contact VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  region VARCHAR(50) NOT NULL,
  status ENUM('active', 'potential', 'inactive') DEFAULT 'potential',
  industry VARCHAR(50),
  address TEXT,
  remark TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark) VALUES
('Alibaba Group', 'Alibaba Group', 'Zhang San', '13800138000', 'zhangsan@alibaba.com', 'East China', 'active', 'Internet', 'Hangzhou', 'Important client'),
('Tencent Technology', 'Tencent Technology', 'Li Si', '13900139000', 'lisi@tencent.com', 'South China', 'potential', 'Internet', 'Shenzhen', 'Potential client'),
('Baidu Company', 'Baidu Company', 'Wang Wu', '13700137000', 'wangwu@baidu.com', 'North China', 'active', 'Internet', 'Beijing', 'Cooperation client');
