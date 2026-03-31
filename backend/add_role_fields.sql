-- 为users表添加角色字段（如果不存在）
USE app_db;

-- 添加role字段
ALTER TABLE users ADD COLUMN role VARCHAR(16) NOT NULL DEFAULT 'sales';

-- 添加team_id字段
ALTER TABLE users ADD COLUMN team_id INT UNSIGNED NOT NULL DEFAULT 1;

-- 验证修改
DESCRIBE users;
