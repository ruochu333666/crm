-- 客户表
CREATE TABLE IF NOT EXISTS customers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL COMMENT '客户名称',
  company VARCHAR(100) NOT NULL COMMENT '公司名称',
  contact VARCHAR(50) NOT NULL COMMENT '联系人',
  phone VARCHAR(20) NOT NULL COMMENT '联系电话',
  email VARCHAR(100) NOT NULL COMMENT '邮箱地址',
  region VARCHAR(50) NOT NULL COMMENT '所属地区',
  status ENUM('active', 'potential', 'inactive') DEFAULT 'potential' COMMENT '客户状态',
  industry VARCHAR(50) COMMENT '所属行业',
  address TEXT COMMENT '详细地址',
  remark TEXT COMMENT '备注信息',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户信息表';

-- 插入测试数据
INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark) VALUES
('阿里巴巴集团', '阿里巴巴集团', '张三', '13800138000', 'zhangsan@alibaba.com', '华东', 'active', '互联网', '杭州市余杭区文一西路969号', '重要客户'),
('腾讯科技', '腾讯科技', '李四', '13900139000', 'lisi@tencent.com', '华南', 'potential', '互联网', '深圳市南山区科技园', '潜在客户'),
('百度公司', '百度公司', '王五', '13700137000', 'wangwu@baidu.com', '华北', 'active', '互联网', '北京市海淀区上地十街10号', '合作客户');
