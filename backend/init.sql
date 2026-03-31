-- MySQL 初始化脚本
CREATE DATABASE IF NOT EXISTS app_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE app_db;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME NOT NULL,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 兼容旧用户表：补充角色与团队
SET @db_name := DATABASE();

SET @exists_role := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'role'
);
SET @sql := IF(
  @exists_role = 0,
  'ALTER TABLE users ADD COLUMN role VARCHAR(16) NOT NULL DEFAULT ''sales''',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_team_id := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'users'
    AND COLUMN_NAME = 'team_id'
);
SET @sql := IF(
  @exists_team_id = 0,
  'ALTER TABLE users ADD COLUMN team_id INT UNSIGNED NOT NULL DEFAULT 1',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS customers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  company VARCHAR(128) NOT NULL,
  contact VARCHAR(64) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  email VARCHAR(128) NOT NULL,
  region VARCHAR(64) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'potential',
  industry VARCHAR(64) NULL,
  address VARCHAR(255) NULL,
  remark TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NOT NULL DEFAULT NOW(),
  owner_user_id INT UNSIGNED NULL,
  pool_status VARCHAR(16) NOT NULL DEFAULT 'private',
  pool_reason VARCHAR(32) NULL,
  pooled_at DATETIME NULL,
  taken_at DATETIME NULL,
  last_follow_up_at DATETIME NULL,
  INDEX idx_name (name),
  INDEX idx_contact (contact),
  INDEX idx_region (region),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 兼容旧版 MySQL：通过 information_schema 判断后再加列
SET @db_name := DATABASE();

SET @exists_owner_user_id := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'customers'
    AND COLUMN_NAME = 'owner_user_id'
);
SET @sql := IF(
  @exists_owner_user_id = 0,
  'ALTER TABLE customers ADD COLUMN owner_user_id INT UNSIGNED NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_pool_status := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'customers'
    AND COLUMN_NAME = 'pool_status'
);
SET @sql := IF(
  @exists_pool_status = 0,
  'ALTER TABLE customers ADD COLUMN pool_status VARCHAR(16) NOT NULL DEFAULT ''private''',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_pool_reason := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'customers'
    AND COLUMN_NAME = 'pool_reason'
);
SET @sql := IF(
  @exists_pool_reason = 0,
  'ALTER TABLE customers ADD COLUMN pool_reason VARCHAR(32) NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_pooled_at := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'customers'
    AND COLUMN_NAME = 'pooled_at'
);
SET @sql := IF(
  @exists_pooled_at = 0,
  'ALTER TABLE customers ADD COLUMN pooled_at DATETIME NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_taken_at := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'customers'
    AND COLUMN_NAME = 'taken_at'
);
SET @sql := IF(
  @exists_taken_at = 0,
  'ALTER TABLE customers ADD COLUMN taken_at DATETIME NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_last_follow_up_at := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'customers'
    AND COLUMN_NAME = 'last_follow_up_at'
);
SET @sql := IF(
  @exists_last_follow_up_at = 0,
  'ALTER TABLE customers ADD COLUMN last_follow_up_at DATETIME NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS followup_records (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNSIGNED NOT NULL,
  owner_user_id INT UNSIGNED NOT NULL,
  method VARCHAR(32) NOT NULL,
  content TEXT NOT NULL,
  next_follow_up_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NOT NULL DEFAULT NOW(),
  INDEX idx_customer_id (customer_id),
  INDEX idx_owner_user_id (owner_user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS tasks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNSIGNED NOT NULL,
  owner_user_id INT UNSIGNED NOT NULL,
  followup_id INT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(32) NOT NULL DEFAULT 'followup',
  source VARCHAR(32) NOT NULL DEFAULT 'manual',
  due_at DATETIME NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'open',
  priority INT NOT NULL DEFAULT 2,
  result TEXT NULL,
  done_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NOT NULL DEFAULT NOW(),
  INDEX idx_customer_id (customer_id),
  INDEX idx_owner_user_id (owner_user_id),
  INDEX idx_due_at (due_at),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET @exists_task_type := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'tasks'
    AND COLUMN_NAME = 'type'
);
SET @sql := IF(
  @exists_task_type = 0,
  'ALTER TABLE tasks ADD COLUMN type VARCHAR(32) NOT NULL DEFAULT ''followup''',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_task_source := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'tasks'
    AND COLUMN_NAME = 'source'
);
SET @sql := IF(
  @exists_task_source = 0,
  'ALTER TABLE tasks ADD COLUMN source VARCHAR(32) NOT NULL DEFAULT ''manual''',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_task_result := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'tasks'
    AND COLUMN_NAME = 'result'
);
SET @sql := IF(
  @exists_task_result = 0,
  'ALTER TABLE tasks ADD COLUMN result TEXT NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @exists_task_done_at := (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name
    AND TABLE_NAME = 'tasks'
    AND COLUMN_NAME = 'done_at'
);
SET @sql := IF(
  @exists_task_done_at = 0,
  'ALTER TABLE tasks ADD COLUMN done_at DATETIME NULL',
  'SELECT 1'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

CREATE TABLE IF NOT EXISTS pool_actions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNSIGNED NOT NULL,
  operator_user_id INT UNSIGNED NOT NULL,
  action VARCHAR(32) NOT NULL,
  from_owner_user_id INT UNSIGNED NULL,
  to_owner_user_id INT UNSIGNED NULL,
  reason VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  INDEX idx_customer_id (customer_id),
  INDEX idx_operator_user_id (operator_user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS pool_rules (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recycle_days INT NOT NULL DEFAULT 15,
  daily_take_limit INT NOT NULL DEFAULT 20,
  followup_required_hours INT NOT NULL DEFAULT 24,
  grab_protect_minutes INT NOT NULL DEFAULT 30,
  need_approval TINYINT(1) NOT NULL DEFAULT 0,
  updated_by INT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NOT NULL DEFAULT NOW()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO pool_rules
  (id, recycle_days, daily_take_limit, followup_required_hours, grab_protect_minutes, need_approval, created_at, updated_at)
SELECT
  1, 15, 20, 24, 30, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM pool_rules WHERE id = 1);

-- 商机：阶段变更审批（需要经理审批）
CREATE TABLE IF NOT EXISTS opportunities (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNSIGNED NOT NULL,
  owner_user_id INT UNSIGNED NOT NULL,
  team_id INT UNSIGNED NOT NULL DEFAULT 1,
  stage VARCHAR(32) NOT NULL DEFAULT 'prospecting',
  title VARCHAR(255) NOT NULL,
  estimated_amount DECIMAL(12,2) NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'CNY',
  expected_close_at DATETIME NULL,
  loss_reason TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  updated_at DATETIME NOT NULL DEFAULT NOW(),
  INDEX idx_customer_id (customer_id),
  INDEX idx_owner_user_id (owner_user_id),
  INDEX idx_team_id (team_id),
  INDEX idx_stage (stage),
  INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS opportunity_actions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  opportunity_id INT UNSIGNED NOT NULL,
  operator_user_id INT UNSIGNED NOT NULL,
  action VARCHAR(64) NOT NULL,
  from_stage VARCHAR(32) NULL,
  to_stage VARCHAR(32) NULL,
  reason TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT NOW(),
  INDEX idx_opportunity_id (opportunity_id),
  INDEX idx_operator_user_id (operator_user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS opportunity_stage_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  opportunity_id INT UNSIGNED NOT NULL,
  from_stage VARCHAR(32) NOT NULL,
  to_stage VARCHAR(32) NOT NULL,
  requested_by_user_id INT UNSIGNED NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'pending', /* pending/approved/rejected/cancelled */
  reason TEXT NULL, /* 销售原因 */
  reject_reason TEXT NULL,
  approved_by_user_id INT UNSIGNED NULL,
  requested_at DATETIME NOT NULL DEFAULT NOW(),
  approved_at DATETIME NULL,
  updated_at DATETIME NOT NULL DEFAULT NOW(),
  INDEX idx_opportunity_id (opportunity_id),
  INDEX idx_requested_by_user_id (requested_by_user_id),
  INDEX idx_status (status),
  INDEX idx_requested_at (requested_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

