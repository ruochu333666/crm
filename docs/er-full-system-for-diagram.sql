-- =============================================================================
-- 贸易 CRM 中等粒度 E-R（论文用）
-- 覆盖：用户、客户、公海规则、跟进、任务、商机、阶段审批、订单
-- 未纳入（避免连线过多）：公海操作日志、商机阶段操作日志
-- =============================================================================

CREATE TABLE `t_user` (
  `user_id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(64) NOT NULL COMMENT '登录账号',
  `password_hash` varchar(255) NOT NULL COMMENT '密码哈希',
  `role` varchar(16) NOT NULL DEFAULT 'sales' COMMENT '角色',
  `team_id` int unsigned NOT NULL DEFAULT 1 COMMENT '团队ID',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uk_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统用户';

CREATE TABLE `t_pool_rule` (
  `rule_id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '规则ID',
  `recycle_days` int NOT NULL DEFAULT 15 COMMENT '未跟进回收天数',
  `daily_take_limit` int NOT NULL DEFAULT 20 COMMENT '每日捞取上限',
  `followup_required_hours` int NOT NULL DEFAULT 24 COMMENT '首跟进时限小时',
  `need_approval` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否需审批',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`rule_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='公海规则';

CREATE TABLE `t_customer` (
  `customer_id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '客户ID',
  `owner_user_id` int unsigned DEFAULT NULL COMMENT '归属业务员ID',
  `name` varchar(128) NOT NULL COMMENT '客户名称',
  `company` varchar(128) NOT NULL COMMENT '企业名称',
  `contact` varchar(64) NOT NULL COMMENT '联系人',
  `phone` varchar(32) NOT NULL COMMENT '电话',
  `email` varchar(128) NOT NULL COMMENT '邮箱',
  `region` varchar(64) NOT NULL COMMENT '地区',
  `status` varchar(16) NOT NULL DEFAULT 'potential' COMMENT '客户状态',
  `pool_status` varchar(16) NOT NULL DEFAULT 'private' COMMENT '公海状态',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`customer_id`),
  KEY `fk_customer_owner` (`owner_user_id`),
  CONSTRAINT `fk_customer_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `t_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户主数据';

CREATE TABLE `t_followup` (
  `followup_id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '跟进ID',
  `customer_id` int unsigned NOT NULL COMMENT '客户ID',
  `owner_user_id` int unsigned NOT NULL COMMENT '跟进人ID',
  `method` varchar(32) NOT NULL COMMENT '跟进方式',
  `content` text NOT NULL COMMENT '沟通纪要',
  `next_follow_up_at` datetime DEFAULT NULL COMMENT '下次跟进时间',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '记录时间',
  PRIMARY KEY (`followup_id`),
  KEY `fk_followup_customer` (`customer_id`),
  KEY `fk_followup_owner` (`owner_user_id`),
  CONSTRAINT `fk_followup_customer` FOREIGN KEY (`customer_id`) REFERENCES `t_customer` (`customer_id`),
  CONSTRAINT `fk_followup_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `t_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户跟进';

CREATE TABLE `t_task` (
  `task_id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `customer_id` int unsigned NOT NULL COMMENT '客户ID',
  `owner_user_id` int unsigned NOT NULL COMMENT '负责人ID',
  `title` varchar(255) NOT NULL COMMENT '任务标题',
  `due_at` datetime NOT NULL COMMENT '截止时间',
  `status` varchar(16) NOT NULL DEFAULT 'open' COMMENT '任务状态',
  `priority` int NOT NULL DEFAULT 2 COMMENT '优先级',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`task_id`),
  KEY `fk_task_customer` (`customer_id`),
  KEY `fk_task_owner` (`owner_user_id`),
  CONSTRAINT `fk_task_customer` FOREIGN KEY (`customer_id`) REFERENCES `t_customer` (`customer_id`),
  CONSTRAINT `fk_task_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `t_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='销售任务';

CREATE TABLE `t_opportunity` (
  `opportunity_id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '商机ID',
  `customer_id` int unsigned NOT NULL COMMENT '客户ID',
  `owner_user_id` int unsigned NOT NULL COMMENT '负责人ID',
  `stage` varchar(32) NOT NULL DEFAULT 'prospecting' COMMENT '销售阶段',
  `title` varchar(255) NOT NULL COMMENT '商机标题',
  `estimated_amount` decimal(12,2) DEFAULT NULL COMMENT '预估金额',
  `currency` varchar(8) NOT NULL DEFAULT 'CNY' COMMENT '币种',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`opportunity_id`),
  KEY `fk_opp_customer` (`customer_id`),
  KEY `fk_opp_owner` (`owner_user_id`),
  CONSTRAINT `fk_opp_customer` FOREIGN KEY (`customer_id`) REFERENCES `t_customer` (`customer_id`),
  CONSTRAINT `fk_opp_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `t_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='销售商机';

CREATE TABLE `t_stage_request` (
  `request_id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '审批单ID',
  `opportunity_id` int unsigned NOT NULL COMMENT '商机ID',
  `from_stage` varchar(32) NOT NULL COMMENT '原阶段',
  `to_stage` varchar(32) NOT NULL COMMENT '目标阶段',
  `requested_by_user_id` int unsigned NOT NULL COMMENT '申请人ID',
  `approved_by_user_id` int unsigned DEFAULT NULL COMMENT '审批人ID',
  `status` varchar(16) NOT NULL DEFAULT 'pending' COMMENT '审批状态',
  `requested_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '申请时间',
  PRIMARY KEY (`request_id`),
  KEY `fk_req_opportunity` (`opportunity_id`),
  KEY `fk_req_requester` (`requested_by_user_id`),
  KEY `fk_req_approver` (`approved_by_user_id`),
  CONSTRAINT `fk_req_opportunity` FOREIGN KEY (`opportunity_id`) REFERENCES `t_opportunity` (`opportunity_id`),
  CONSTRAINT `fk_req_requester` FOREIGN KEY (`requested_by_user_id`) REFERENCES `t_user` (`user_id`),
  CONSTRAINT `fk_req_approver` FOREIGN KEY (`approved_by_user_id`) REFERENCES `t_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商机阶段审批';

CREATE TABLE `t_order` (
  `order_id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `customer_id` int unsigned NOT NULL COMMENT '客户ID',
  `owner_user_id` int unsigned NOT NULL COMMENT '归属人ID',
  `order_no` varchar(40) NOT NULL COMMENT '订单编号',
  `product_summary` varchar(512) NOT NULL COMMENT '标的摘要',
  `amount` decimal(12,2) NOT NULL DEFAULT 0 COMMENT '金额',
  `currency` varchar(8) NOT NULL DEFAULT 'CNY' COMMENT '币种',
  `status` varchar(32) NOT NULL DEFAULT 'pending' COMMENT '订单状态',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`order_id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `fk_order_customer` (`customer_id`),
  KEY `fk_order_owner` (`owner_user_id`),
  CONSTRAINT `fk_order_customer` FOREIGN KEY (`customer_id`) REFERENCES `t_customer` (`customer_id`),
  CONSTRAINT `fk_order_owner` FOREIGN KEY (`owner_user_id`) REFERENCES `t_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='贸易订单';
