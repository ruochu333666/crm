-- =============================================================================
-- 演示数据种子（外贸/B2B 风格，量较大，便于联调与写论文截图）
--
-- 推荐（不依赖 mysql 在 PATH，Windows 可用）：
--   cd backend && npm run seed
--
-- 或 CMD：mysql -u root -p app_db < backend\seed_demo_data.sql
-- PowerShell 勿用 < 重定向，请用：
--   Get-Content backend\seed_demo_data.sql -Raw | mysql -u root -p app_db
--
-- 登录：demo / demo123（销售）  manager / demo123（经理，可看审批）
-- 说明：依赖 init.sql 已建表；可多次执行，客户/订单等按唯一键跳过已存在记录。
-- =============================================================================

USE app_db;

-- 密码均为 demo123（bcrypt cost 10）
SET @pwd := '$2a$10$k4/PtLaycX.OqpEsAPFkWe5k8d6QE/yKAw/c4V2ZcBf9Ve97bAVFq';

INSERT INTO users (username, password_hash, created_at, role, team_id)
SELECT 'demo', @pwd, NOW(), 'sales', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'demo');

INSERT INTO users (username, password_hash, created_at, role, team_id)
SELECT 'manager', @pwd, NOW(), 'manager', 1
FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'manager');

SET @demo := (SELECT id FROM users WHERE username = 'demo' LIMIT 1);
SET @mgr := (SELECT id FROM users WHERE username = 'manager' LIMIT 1);

-- ---------------------------------------------------------------------------
-- 私有客户（归属 demo）
-- ---------------------------------------------------------------------------
INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, created_at, updated_at, last_follow_up_at, taken_at)
SELECT * FROM (SELECT '江苏宏远机电' AS name, '江苏宏远机电有限公司' AS company, '陈建军' AS contact, '13851234001' AS phone, 'chen.jianjun@hyjd.cn' AS email, '华东' AS region, 'active' AS status, '机械制造' AS industry, '苏州市工业园区星湖街328号创意产业园8幢' AS address, '年采购约800万，重点跟进出海仓位与账期' AS remark, @demo AS owner_user_id, 'private' AS pool_status, '2025-08-10 10:00:00' AS created_at, NOW() AS updated_at, '2026-03-28 15:20:00' AS last_follow_up_at, '2025-08-11 09:00:00' AS taken_at) AS t
WHERE @demo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '江苏宏远机电有限公司' AND c.owner_user_id <=> @demo);

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, created_at, updated_at, last_follow_up_at, taken_at)
SELECT * FROM (SELECT '宁波凯越进出口', '宁波凯越进出口有限公司', '林晓雯', '13957402880', 'lin.xw@kaiyue-exim.com', '华东', 'active', '贸易批发', '宁波市鄞州区天童北路和邦大厦C座', '主做欧美商超，SKU 多、对交期敏感', @demo, 'private', '2025-09-02 11:30:00', NOW(), '2026-03-25 10:00:00', '2025-09-03 14:00:00') AS t
WHERE @demo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '宁波凯越进出口有限公司' AND c.owner_user_id <=> @demo);

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, created_at, updated_at, last_follow_up_at, taken_at)
SELECT * FROM (SELECT '青岛海德水产', '青岛海德水产品集团有限公司', '王海涛', '13605321888', 'wang.ht@haide-seafood.com', '华北', 'potential', '食品加工', '青岛市崂山区香港东路海尔路交叉口中商大厦', '新线索：东南亚冻品线，需验厂', @demo, 'private', '2025-11-18 09:15:00', NOW(), '2026-04-01 16:00:00', '2025-11-20 10:00:00') AS t
WHERE @demo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '青岛海德水产品集团有限公司' AND c.owner_user_id <=> @demo);

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, created_at, updated_at, last_follow_up_at, taken_at)
SELECT * FROM (SELECT '佛山馨家照明', '佛山市馨家照明科技有限公司', '黄思琪', '13702635519', 'huang.sq@xinhome-led.com', '华南', 'active', '照明电子', '佛山市南海区桂城街道天安数码城3期', '工程渠道+电商双轨，关注认证与质保条款', @demo, 'private', '2025-07-22 14:40:00', NOW(), '2026-03-20 11:30:00', '2025-07-23 09:30:00') AS t
WHERE @demo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '佛山市馨家照明科技有限公司' AND c.owner_user_id <=> @demo);

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, created_at, updated_at, last_follow_up_at, taken_at)
SELECT * FROM (SELECT '义乌联采中心', '义乌小商品城联采中心', '赵志明', '13588669901', 'zhao.zm@yiwu-lc.com', '华东', 'active', '零售百货', '义乌市稠州北路国际商贸城二区东辅房', '拼柜为主，价格极度敏感', @demo, 'private', '2025-10-05 08:50:00', NOW(), '2026-03-29 09:00:00', '2025-10-06 13:00:00') AS t
WHERE @demo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '义乌小商品城联采中心' AND c.owner_user_id <=> @demo);

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, created_at, updated_at, last_follow_up_at, taken_at)
SELECT * FROM (SELECT '厦门跨境通', '厦门跨境通供应链管理有限公司', '张雨彤', '13806051234', 'zhang.yt@xm-kjt.com', '华南', 'active', '跨境物流', '厦门市湖里区象屿保税区象兴一路11号', '美线快船+海外仓，月柜量稳定', @demo, 'private', '2025-06-14 16:20:00', NOW(), '2026-03-27 14:10:00', '2025-06-15 10:00:00') AS t
WHERE @demo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '厦门跨境通供应链管理有限公司' AND c.owner_user_id <=> @demo);

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, created_at, updated_at, last_follow_up_at, taken_at)
SELECT * FROM (SELECT '合肥中科芯片', '合肥中科芯片应用技术有限公司', '刘洋', '18655110288', 'liu.yang@zk-chip.cn', '华东', 'potential', '电子半导体', '合肥市高新区望江西路800号创新产业园', '样品阶段，关注交期与原产地证明', @demo, 'private', '2026-01-08 13:00:00', NOW(), '2026-04-05 10:00:00', '2026-01-09 09:00:00') AS t
WHERE @demo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '合肥中科芯片应用技术有限公司' AND c.owner_user_id <=> @demo);

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, created_at, updated_at, last_follow_up_at, taken_at)
SELECT * FROM (SELECT '成都天府农批', '成都天府农产品批发市场运营部', '何从军', '15802887766', 'he.congjun@tf-np.com', '西南', 'active', '农批冷链', '成都市双流区成白路成都农产品中心批发市场', '季节性高峰前会集中采购包装耗材', @demo, 'private', '2025-05-30 10:10:00', NOW(), '2026-03-22 08:40:00', '2025-06-01 11:00:00') AS t
WHERE @demo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '成都天府农产品批发市场运营部' AND c.owner_user_id <=> @demo);

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, created_at, updated_at, last_follow_up_at, taken_at)
SELECT * FROM (SELECT '天津振华保税物流', '天津港保税区振华国际物流有限公司', '马立新', '13920018899', 'ma.lixin@zhenhua-tj.com', '华北', 'active', '物流货代', '天津市滨海新区天津港集装箱码头配套服务区', '保税仓+一日游，对单证准确率要求高', @demo, 'private', '2025-04-19 15:00:00', NOW(), '2026-03-30 17:00:00', '2025-04-21 09:00:00') AS t
WHERE @demo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '天津港保税区振华国际物流有限公司' AND c.owner_user_id <=> @demo);

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, created_at, updated_at, last_follow_up_at, taken_at)
SELECT * FROM (SELECT '温州纽扣协会办', '温州市纽扣行业协会采购办公室', '金丽华', '13777701234', 'jin.lihua@wz-button.org', '华东', 'inactive', '纺织服装', '温州市永嘉县桥头镇钮扣产业园管委会', '去年大单已结束，保持季度问候', @demo, 'private', '2024-11-11 09:00:00', NOW(), '2025-12-01 10:00:00', '2024-11-12 10:00:00') AS t
WHERE @demo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '温州市纽扣行业协会采购办公室' AND c.owner_user_id <=> @demo);

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, created_at, updated_at, last_follow_up_at, taken_at)
SELECT * FROM (SELECT '东莞精密模具', '东莞市精密模具制造有限公司', '吴家豪', '13602345678', 'wu.jh@dg-mold.com', '华南', 'active', '机械制造', '东莞市长安镇乌沙社区环东路', '出口模具配件，常用 DHL/FedEx 样件', @demo, 'private', '2025-09-28 11:11:00', NOW(), '2026-03-26 13:20:00', '2025-09-29 08:30:00') AS t
WHERE @demo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '东莞市精密模具制造有限公司' AND c.owner_user_id <=> @demo);

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, created_at, updated_at, last_follow_up_at, taken_at)
SELECT * FROM (SELECT '上海璞真医疗', '上海璞真医疗器械有限公司', '孙婧', '13801761234', 'sun.jing@puzhen-med.com', '华东', 'potential', '医疗器械', '上海市浦东新区张江高科技园区科苑路399号', '注册资料审核中，暂不急单', @demo, 'private', '2026-02-14 10:30:00', NOW(), '2026-04-10 15:00:00', '2026-02-15 09:00:00') AS t
WHERE @demo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '上海璞真医疗器械有限公司' AND c.owner_user_id <=> @demo);

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, created_at, updated_at, last_follow_up_at, taken_at)
SELECT * FROM (SELECT '杭州丝绸外贸', '杭州丝绸进出口有限公司', '周敏', '13957110022', 'zhou.min@hz-silk.com', '华东', 'active', '纺织服装', '杭州市上城区凯旋路445号物产国际广场', '真丝面料季单，需关注熏蒸与虫蛀证明', @demo, 'private', '2025-08-01 09:20:00', NOW(), '2026-03-21 10:50:00', '2025-08-02 14:00:00') AS t
WHERE @demo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '杭州丝绸进出口有限公司' AND c.owner_user_id <=> @demo);

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, created_at, updated_at, last_follow_up_at, taken_at)
SELECT * FROM (SELECT '郑州冷链仓储', '郑州冷链仓储运营有限公司', '韩磊', '15637128800', 'han.lei@zz-cold.com', '华中', 'active', '冷链物流', '郑州市航空港区双鹤湖冷链物流园', '冷库扩建项目相关设备进口', @demo, 'private', '2025-12-03 14:00:00', NOW(), '2026-03-24 09:10:00', '2025-12-04 10:00:00') AS t
WHERE @demo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '郑州冷链仓储运营有限公司' AND c.owner_user_id <=> @demo);

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, created_at, updated_at, last_follow_up_at, taken_at)
SELECT * FROM (SELECT '武汉光谷激光', '武汉光谷激光设备有限公司', '徐帆', '18971660088', 'xu.fan@optics-wh.com', '华中', 'potential', '机械制造', '武汉市东湖高新区高新大道999号未来科技城', '德国备件询比价，技术参数核对中', @demo, 'private', '2026-03-01 11:00:00', NOW(), '2026-04-02 16:00:00', '2026-03-02 09:00:00') AS t
WHERE @demo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '武汉光谷激光设备有限公司' AND c.owner_user_id <=> @demo);

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, created_at, updated_at, last_follow_up_at, taken_at)
SELECT * FROM (SELECT '沈阳重型配件', '沈阳重型机械配件经销处', '郑国强', '13898887766', 'zheng.gq@sy-heavy.com', '东北', 'active', '批发零售', '沈阳市铁西区建设大路云峰街五金城', '俄线陆运拼车，关注卢布结算风险', @demo, 'private', '2025-10-20 08:00:00', NOW(), '2026-03-23 12:00:00', '2025-10-21 09:00:00') AS t
WHERE @demo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '沈阳重型机械配件经销处' AND c.owner_user_id <=> @demo);

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, created_at, updated_at, last_follow_up_at, taken_at)
SELECT * FROM (SELECT '西安丝路电商', '西安丝路电子商务有限公司', '白洁', '18602905678', 'bai.jie@xa-silkroad.com', '西北', 'active', '跨境电商', '西安市高新区锦业路绿地领海大厦', '中亚五国小包+整柜混发', @demo, 'private', '2025-07-07 13:40:00', NOW(), '2026-03-19 14:30:00', '2025-07-08 10:00:00') AS t
WHERE @demo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '西安丝路电子商务有限公司' AND c.owner_user_id <=> @demo);

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, created_at, updated_at, last_follow_up_at, taken_at)
SELECT * FROM (SELECT '重庆摩配城', '重庆摩托车配件城（集团采购）', '邓小军', '13983001200', 'deng.xj@cq-moto.com', '西南', 'potential', '汽摩配件', '重庆市巴南区华南城五金机电市场', '东南亚售后件，小批量多批次', @demo, 'private', '2026-02-20 10:00:00', NOW(), '2026-04-08 11:00:00', '2026-02-21 09:30:00') AS t
WHERE @demo IS NOT NULL AND NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '重庆摩托车配件城（集团采购）' AND c.owner_user_id <=> @demo);

-- ---------------------------------------------------------------------------
-- 公海线索（无归属）
-- ---------------------------------------------------------------------------
INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, pool_reason, pooled_at, created_at, updated_at)
SELECT * FROM (SELECT '公海-广州五金' AS name, '广州某五金商行（未认证）' AS company, '前台' AS contact, '020-85550001' AS phone, 'info@placeholder-gz.cn' AS email, '华南' AS region, 'potential' AS status, '五金建材' AS industry, '广州市白云区某五金城（待核实门牌）' AS address, '展会名片导入，尚未接通决策人' AS remark, NULL AS owner_user_id, 'pool' AS pool_status, 'seed' AS pool_reason, '2026-03-15 12:00:00' AS pooled_at, '2026-03-15 12:00:00' AS created_at, NOW() AS updated_at) AS t
WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '广州某五金商行（未认证）' AND c.pool_status = 'pool');

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, pool_reason, pooled_at, created_at, updated_at)
SELECT * FROM (SELECT '公海-济南化工' AS name, '济南化工原料询价（临时）' AS company, '李工' AS contact, '18653100000' AS phone, 'chem-inquiry@temp-mail.test' AS email, '华北' AS region, 'potential' AS status, '化工' AS industry, '济南市历城区某工业园（待拜访）' AS address, '仅邮件询价硫酸镍，需资质核验' AS remark, NULL AS owner_user_id, 'pool' AS pool_status, 'seed' AS pool_reason, '2026-03-18 09:00:00' AS pooled_at, '2026-03-18 09:00:00' AS created_at, NOW() AS updated_at) AS t
WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '济南化工原料询价（临时）' AND c.pool_status = 'pool');

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, pool_reason, pooled_at, created_at, updated_at)
SELECT * FROM (SELECT '公海-海口酒店' AS name, '海口连锁酒店用品批量采购' AS company, '采购部' AS contact, '0898-66881234' AS phone, 'procurement@hk-hotel.temp' AS email, '华南' AS region, 'potential' AS status, '酒店用品' AS industry, '海口市美兰区海府路某酒店集团总部' AS address, '年度布草更换标案，截标日未公开' AS remark, NULL AS owner_user_id, 'pool' AS pool_status, 'seed' AS pool_reason, '2026-03-20 16:30:00' AS pooled_at, '2026-03-20 16:30:00' AS created_at, NOW() AS updated_at) AS t
WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '海口连锁酒店用品批量采购' AND c.pool_status = 'pool');

INSERT INTO customers (name, company, contact, phone, email, region, status, industry, address, remark, owner_user_id, pool_status, pool_reason, pooled_at, created_at, updated_at)
SELECT * FROM (SELECT '公海-兰州建材' AS name, '兰州建材批发商（公海）' AS company, '王老板' AS contact, '13919910000' AS phone, 'boss@lz-build.temp' AS email, '西北' AS region, 'potential' AS status, '建材' AS industry, '兰州市城关区东岗东路建材市场' AS address, '电话未接，建议短信跟进' AS remark, NULL AS owner_user_id, 'pool' AS pool_status, 'seed' AS pool_reason, '2026-03-22 11:00:00' AS pooled_at, '2026-03-22 11:00:00' AS created_at, NOW() AS updated_at) AS t
WHERE NOT EXISTS (SELECT 1 FROM customers c WHERE c.company = '兰州建材批发商（公海）' AND c.pool_status = 'pool');

-- ---------------------------------------------------------------------------
-- 跟进记录（按公司名关联客户）
-- ---------------------------------------------------------------------------
INSERT INTO followup_records (customer_id, owner_user_id, method, content, next_follow_up_at, created_at, updated_at)
SELECT c.id, @demo, 'phone', '与陈工确认伺服电机铭牌电压等级，对方同意按 380V 三相配柜。约定下周发终版 PI。', NULL, '2026-03-28 15:20:00', NOW()
FROM customers c WHERE c.company = '江苏宏远机电有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM followup_records f WHERE f.customer_id = c.id AND f.content LIKE '与陈工确认伺服电机%') LIMIT 1;

INSERT INTO followup_records (customer_id, owner_user_id, method, content, next_follow_up_at, created_at, updated_at)
SELECT c.id, @demo, 'email', '已发送最新海运费报价（上海—鹿特丹 40HQ）及堆存条款说明，抄送财务。', '2026-04-05 10:00:00', '2026-03-20 09:30:00', NOW()
FROM customers c WHERE c.company = '江苏宏远机电有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM followup_records f WHERE f.customer_id = c.id AND f.content LIKE '已发送最新海运费报价%') LIMIT 1;

INSERT INTO followup_records (customer_id, owner_user_id, method, content, next_follow_up_at, created_at, updated_at)
SELECT c.id, @demo, 'meeting', '宁波面谈：对方计划把东南亚线转口合并到一个供应商，需要我们出 KPI 对账模板。', NULL, '2026-03-10 16:00:00', NOW()
FROM customers c WHERE c.company = '宁波凯越进出口有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM followup_records f WHERE f.customer_id = c.id AND f.content LIKE '宁波面谈：对方计划把东南亚线%') LIMIT 1;

INSERT INTO followup_records (customer_id, owner_user_id, method, content, next_follow_up_at, created_at, updated_at)
SELECT c.id, @demo, 'im', '微信：林小姐催要 Form A 样本格式，已发模板并提醒抬头必须与提单一致。', NULL, '2026-03-26 11:00:00', NOW()
FROM customers c WHERE c.company = '宁波凯越进出口有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM followup_records f WHERE f.customer_id = c.id AND f.content LIKE '微信：林小姐催要 Form A%') LIMIT 1;

INSERT INTO followup_records (customer_id, owner_user_id, method, content, next_follow_up_at, created_at, updated_at)
SELECT c.id, @demo, 'phone', '海德水产：质检部希望到港前提供第三方冷箱温度记录，已协调船公司接口人。', NULL, '2026-03-29 14:00:00', NOW()
FROM customers c WHERE c.company = '青岛海德水产品集团有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM followup_records f WHERE f.customer_id = c.id AND f.content LIKE '海德水产：质检部希望到港前%') LIMIT 1;

INSERT INTO followup_records (customer_id, owner_user_id, method, content, next_follow_up_at, created_at, updated_at)
SELECT c.id, @demo, 'email', '馨家照明：工程标案补充 CE+RoHS 证书扫描件，已打包 ZIP 发出。', '2026-04-02 10:00:00', '2026-03-21 10:15:00', NOW()
FROM customers c WHERE c.company = '佛山市馨家照明科技有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM followup_records f WHERE f.customer_id = c.id AND f.content LIKE '馨家照明：工程标案补充 CE%') LIMIT 1;

INSERT INTO followup_records (customer_id, owner_user_id, method, content, next_follow_up_at, created_at, updated_at)
SELECT c.id, @demo, 'phone', '义乌联采：砍价至 FOB 基准价下浮 1.5%，需内部申请特价舱保。', NULL, '2026-03-27 17:00:00', NOW()
FROM customers c WHERE c.company = '义乌小商品城联采中心' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM followup_records f WHERE f.customer_id = c.id AND f.content LIKE '义乌联采：砍价至 FOB%') LIMIT 1;

INSERT INTO followup_records (customer_id, owner_user_id, method, content, next_follow_up_at, created_at, updated_at)
SELECT c.id, @demo, 'meeting', '跨境通：复盘美西港口拥堵，建议改靠长滩 B 码头并预留 7 天免箱期。', NULL, '2026-03-18 11:20:00', NOW()
FROM customers c WHERE c.company = '厦门跨境通供应链管理有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM followup_records f WHERE f.customer_id = c.id AND f.content LIKE '跨境通：复盘美西港口拥堵%') LIMIT 1;

INSERT INTO followup_records (customer_id, owner_user_id, method, content, next_follow_up_at, created_at, updated_at)
SELECT c.id, @demo, 'other', '中科芯片：技术部索要晶圆原产地说明，已转法务起草标准回复函。', '2026-04-06 09:00:00', '2026-03-30 10:00:00', NOW()
FROM customers c WHERE c.company = '合肥中科芯片应用技术有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM followup_records f WHERE f.customer_id = c.id AND f.content LIKE '中科芯片：技术部索要晶圆原产地%') LIMIT 1;

INSERT INTO followup_records (customer_id, owner_user_id, method, content, next_follow_up_at, created_at, updated_at)
SELECT c.id, @demo, 'phone', '天府农批：清明节前泡沫箱需求翻倍，已锁舱并预留 2 个冷插。', NULL, '2026-03-25 08:00:00', NOW()
FROM customers c WHERE c.company = '成都天府农产品批发市场运营部' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM followup_records f WHERE f.customer_id = c.id AND f.content LIKE '天府农批：清明节前泡沫箱%') LIMIT 1;

INSERT INTO followup_records (customer_id, owner_user_id, method, content, next_follow_up_at, created_at, updated_at)
SELECT c.id, @demo, 'email', '振华物流：保税一日游报关草单已发，客户核对 HS 编码 8479.89。', NULL, '2026-03-31 09:00:00', NOW()
FROM customers c WHERE c.company = '天津港保税区振华国际物流有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM followup_records f WHERE f.customer_id = c.id AND f.content LIKE '振华物流：保税一日游报关草单%') LIMIT 1;

INSERT INTO followup_records (customer_id, owner_user_id, method, content, next_follow_up_at, created_at, updated_at)
SELECT c.id, @demo, 'phone', '东莞模具：FedEx 样件追踪号已同步，预计明日上午签收。', NULL, '2026-03-24 16:00:00', NOW()
FROM customers c WHERE c.company = '东莞市精密模具制造有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM followup_records f WHERE f.customer_id = c.id AND f.content LIKE '东莞模具：FedEx 样件追踪号%') LIMIT 1;

INSERT INTO followup_records (customer_id, owner_user_id, method, content, next_follow_up_at, created_at, updated_at)
SELECT c.id, @demo, 'im', '璞真医疗：注册经理出差，下周三再约视频会议。', NULL, '2026-03-28 13:00:00', NOW()
FROM customers c WHERE c.company = '上海璞真医疗器械有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM followup_records f WHERE f.customer_id = c.id AND f.content LIKE '璞真医疗：注册经理出差%') LIMIT 1;

INSERT INTO followup_records (customer_id, owner_user_id, method, content, next_follow_up_at, created_at, updated_at)
SELECT c.id, @demo, 'email', '杭州丝绸：熏蒸证书抬头更正为合同买方，已通知货代改单。', NULL, '2026-03-22 09:40:00', NOW()
FROM customers c WHERE c.company = '杭州丝绸进出口有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM followup_records f WHERE f.customer_id = c.id AND f.content LIKE '杭州丝绸：熏蒸证书抬头更正%') LIMIT 1;

INSERT INTO followup_records (customer_id, owner_user_id, method, content, next_follow_up_at, created_at, updated_at)
SELECT c.id, @demo, 'phone', '郑州冷链：压缩机进口项目讨论关税减免目录，建议拆分发票。', '2026-04-12 14:00:00', '2026-03-23 15:00:00', NOW()
FROM customers c WHERE c.company = '郑州冷链仓储运营有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM followup_records f WHERE f.customer_id = c.id AND f.content LIKE '郑州冷链：压缩机进口项目讨论%') LIMIT 1;

INSERT INTO followup_records (customer_id, owner_user_id, method, content, next_follow_up_at, created_at, updated_at)
SELECT c.id, @demo, 'phone', '西安丝路：阿拉木图拼箱货值申报边界咨询，已约关务同事介入。', NULL, '2026-03-29 10:30:00', NOW()
FROM customers c WHERE c.company = '西安丝路电子商务有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM followup_records f WHERE f.customer_id = c.id AND f.content LIKE '西安丝路：阿拉木图拼箱货值%') LIMIT 1;

-- ---------------------------------------------------------------------------
-- 订单（order_no 以 SEED- 前缀，幂等）
-- ---------------------------------------------------------------------------
INSERT INTO orders (customer_id, owner_user_id, order_no, product_summary, amount, currency, incoterms, shipping_method, logistics_no, deposit_amount, balance_amount, status, ordered_at, expected_ship_at, shipped_at, remark, created_at, updated_at)
SELECT c.id, @demo, 'SEED-ORD-20260201-HYJD', '伺服电机 MR-J4-40A × 200 台 · 附连接线束', 372000.00, 'CNY', 'FOB Shanghai', '海运 40HQ', 'COSU6374012001', 186000, 186000, 'completed', '2026-02-01 09:00:00', '2026-03-10 00:00:00', '2026-03-08 14:00:00', '尾款已结清，客户好评', NOW(), NOW()
FROM customers c WHERE c.company = '江苏宏远机电有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_no = 'SEED-ORD-20260201-HYJD') LIMIT 1;

INSERT INTO orders (customer_id, owner_user_id, order_no, product_summary, amount, currency, incoterms, shipping_method, logistics_no, deposit_amount, balance_amount, status, ordered_at, expected_ship_at, shipped_at, remark, created_at, updated_at)
SELECT c.id, @demo, 'SEED-ORD-20260305-KY', '塑料收纳箱（混装）· 3×40HQ 约 4.2 万件', 285600.00, 'USD', 'FOB Ningbo', '海运', 'MSKU9017264', 50000, 235600, 'shipped', '2026-03-05 11:00:00', '2026-03-28 00:00:00', '2026-03-25 09:30:00', '美元锁汇 T+2', NOW(), NOW()
FROM customers c WHERE c.company = '宁波凯越进出口有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_no = 'SEED-ORD-20260305-KY') LIMIT 1;

INSERT INTO orders (customer_id, owner_user_id, order_no, product_summary, amount, currency, incoterms, shipping_method, logistics_no, deposit_amount, balance_amount, status, ordered_at, expected_ship_at, shipped_at, remark, created_at, updated_at)
SELECT c.id, @demo, 'SEED-ORD-20260312-HD', '冻带鱼 去头去尾 · -18℃ 冷柜', 128000.00, 'CNY', 'CIF Busan', '冷藏船', NULL, 64000, 64000, 'producing', '2026-03-12 08:30:00', '2026-04-05 00:00:00', NULL, '等韩方验厂报告', NOW(), NOW()
FROM customers c WHERE c.company = '青岛海德水产品集团有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_no = 'SEED-ORD-20260312-HD') LIMIT 1;

INSERT INTO orders (customer_id, owner_user_id, order_no, product_summary, amount, currency, incoterms, shipping_method, logistics_no, deposit_amount, balance_amount, status, ordered_at, expected_ship_at, shipped_at, remark, created_at, updated_at)
SELECT c.id, @demo, 'SEED-ORD-20260318-XJ', 'LED 面板灯 600×600 × 1200 套', 96000.00, 'EUR', 'EXW Foshan', '客户自提', NULL, 20000, 76000, 'pending', '2026-03-18 15:00:00', NULL, NULL, '等客户开信用证草稿', NOW(), NOW()
FROM customers c WHERE c.company = '佛山市馨家照明科技有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_no = 'SEED-ORD-20260318-XJ') LIMIT 1;

INSERT INTO orders (customer_id, owner_user_id, order_no, product_summary, amount, currency, incoterms, shipping_method, logistics_no, deposit_amount, balance_amount, status, ordered_at, expected_ship_at, shipped_at, remark, created_at, updated_at)
SELECT c.id, @demo, 'SEED-ORD-20260220-YW', '百货拼箱 LCL · 义乌—汉堡', 45600.00, 'CNY', 'FOB Yiwu', '海运拼箱', 'OOLU9988776655', 22800, 22800, 'delivered', '2026-02-20 10:00:00', '2026-03-01 00:00:00', '2026-02-28 18:00:00', '已签收未异议', NOW(), NOW()
FROM customers c WHERE c.company = '义乌小商品城联采中心' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_no = 'SEED-ORD-20260220-YW') LIMIT 1;

INSERT INTO orders (customer_id, owner_user_id, order_no, product_summary, amount, currency, incoterms, shipping_method, logistics_no, deposit_amount, balance_amount, status, ordered_at, expected_ship_at, shipped_at, remark, created_at, updated_at)
SELECT c.id, @demo, 'SEED-ORD-20260320-XM', '美森快船 + 海外仓入库操作费（3 月包量）', 188000.00, 'CNY', 'CIF Long Beach', '快船+卡车', 'MATSON-CLP-33091', 94000, 94000, 'pending', '2026-03-20 09:00:00', '2026-04-01 00:00:00', NULL, '合同条款法务二审中', NOW(), NOW()
FROM customers c WHERE c.company = '厦门跨境通供应链管理有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_no = 'SEED-ORD-20260320-XM') LIMIT 1;

INSERT INTO orders (customer_id, owner_user_id, order_no, product_summary, amount, currency, incoterms, shipping_method, logistics_no, deposit_amount, balance_amount, status, ordered_at, expected_ship_at, shipped_at, remark, created_at, updated_at)
SELECT c.id, @demo, 'SEED-ORD-20260325-HF', '工业 MCU 样品 500 pcs · 技术验证批次', 42000.00, 'CNY', 'FCA Hefei', '顺丰国际', 'SF1029384756HK', 42000, 0, 'shipped', '2026-03-25 13:00:00', '2026-03-27 00:00:00', '2026-03-26 10:00:00', '样品全款预付', NOW(), NOW()
FROM customers c WHERE c.company = '合肥中科芯片应用技术有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_no = 'SEED-ORD-20260325-HF') LIMIT 1;

INSERT INTO orders (customer_id, owner_user_id, order_no, product_summary, amount, currency, incoterms, shipping_method, logistics_no, deposit_amount, balance_amount, status, ordered_at, expected_ship_at, shipped_at, remark, created_at, updated_at)
SELECT c.id, @demo, 'SEED-ORD-20260310-CD', '泡沫箱 + 冰袋套装 × 8000 套', 64000.00, 'CNY', 'DDP Chengdu', '陆运冷链', 'YTOCD88442211', 32000, 32000, 'completed', '2026-03-10 07:00:00', '2026-03-18 00:00:00', '2026-03-17 06:00:00', '季前备货', NOW(), NOW()
FROM customers c WHERE c.company = '成都天府农产品批发市场运营部' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_no = 'SEED-ORD-20260310-CD') LIMIT 1;

INSERT INTO orders (customer_id, owner_user_id, order_no, product_summary, amount, currency, incoterms, shipping_method, logistics_no, deposit_amount, balance_amount, status, ordered_at, expected_ship_at, shipped_at, remark, created_at, updated_at)
SELECT c.id, @demo, 'SEED-ORD-20260302-TJ', '保税一日游报关服务包 · 月度', 36000.00, 'CNY', 'DAT Tianjin Port', '监管车', NULL, 18000, 18000, 'completed', '2026-03-02 09:00:00', '2026-03-31 00:00:00', NULL, '按月结算', NOW(), NOW()
FROM customers c WHERE c.company = '天津港保税区振华国际物流有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_no = 'SEED-ORD-20260302-TJ') LIMIT 1;

INSERT INTO orders (customer_id, owner_user_id, order_no, product_summary, amount, currency, incoterms, shipping_method, logistics_no, deposit_amount, balance_amount, status, ordered_at, expected_ship_at, shipped_at, remark, created_at, updated_at)
SELECT c.id, @demo, 'SEED-ORD-20260328-DG', '精密顶针组件 × 200 套（样件+大货）', 26800.00, 'USD', 'DAP Chicago', 'FedEx', '8801-2222-3333', 13400, 13400, 'pending', '2026-03-28 10:00:00', '2026-04-10 00:00:00', NULL, '等客户 PO 号', NOW(), NOW()
FROM customers c WHERE c.company = '东莞市精密模具制造有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_no = 'SEED-ORD-20260328-DG') LIMIT 1;

INSERT INTO orders (customer_id, owner_user_id, order_no, product_summary, amount, currency, incoterms, shipping_method, logistics_no, deposit_amount, balance_amount, status, ordered_at, expected_ship_at, shipped_at, remark, created_at, updated_at)
SELECT c.id, @demo, 'SEED-ORD-20260315-ZZ', '冷库用冷风机备件 × 1 批', 195000.00, 'CNY', 'CIP Zhengzhou', '空运+陆运', 'CA1888099', 97500, 97500, 'producing', '2026-03-15 14:00:00', '2026-04-20 00:00:00', NULL, '大件需落地查验预约', NOW(), NOW()
FROM customers c WHERE c.company = '郑州冷链仓储运营有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_no = 'SEED-ORD-20260315-ZZ') LIMIT 1;

INSERT INTO orders (customer_id, owner_user_id, order_no, product_summary, amount, currency, incoterms, shipping_method, logistics_no, deposit_amount, balance_amount, status, ordered_at, expected_ship_at, shipped_at, remark, created_at, updated_at)
SELECT c.id, @demo, 'SEED-ORD-20260308-XA', '中亚线路拼箱 + 清关咨询（预付）', 12000.00, 'CNY', 'DAP Almaty', '铁路拼箱', NULL, 12000, 0, 'shipped', '2026-03-08 11:00:00', '2026-03-22 00:00:00', '2026-03-21 20:00:00', '咨询费一次性', NOW(), NOW()
FROM customers c WHERE c.company = '西安丝路电子商务有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM orders o WHERE o.order_no = 'SEED-ORD-20260308-XA') LIMIT 1;

-- ---------------------------------------------------------------------------
-- 任务
-- ---------------------------------------------------------------------------
INSERT INTO tasks (customer_id, owner_user_id, followup_id, title, type, source, due_at, status, priority, result, done_at, created_at, updated_at)
SELECT c.id, @demo, NULL, '回传海德水产冷箱温度记录模板', 'followup', 'manual', '2026-04-02 18:00:00', 'open', 2, NULL, NULL, NOW(), NOW()
FROM customers c WHERE c.company = '青岛海德水产品集团有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.customer_id = c.id AND t.title LIKE '回传海德水产%') LIMIT 1;

INSERT INTO tasks (customer_id, owner_user_id, followup_id, title, type, source, due_at, status, priority, result, done_at, created_at, updated_at)
SELECT c.id, @demo, NULL, '馨家照明：催开信用证草稿', 'followup', 'manual', '2026-04-03 12:00:00', 'open', 1, NULL, NULL, NOW(), NOW()
FROM customers c WHERE c.company = '佛山市馨家照明科技有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.customer_id = c.id AND t.title LIKE '馨家照明：催开信用证%') LIMIT 1;

INSERT INTO tasks (customer_id, owner_user_id, followup_id, title, type, source, due_at, status, priority, result, done_at, created_at, updated_at)
SELECT c.id, @demo, NULL, '义乌联采：特价舱保内部审批', 'other', 'manual', '2026-03-30 17:00:00', 'done', 2, '已批复 1.5% 下浮', '2026-03-29 16:00:00', NOW(), NOW()
FROM customers c WHERE c.company = '义乌小商品城联采中心' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.customer_id = c.id AND t.title LIKE '义乌联采：特价舱保%') LIMIT 1;

INSERT INTO tasks (customer_id, owner_user_id, followup_id, title, type, source, due_at, status, priority, result, done_at, created_at, updated_at)
SELECT c.id, @demo, NULL, '璞真医疗：约注册经理视频会议', 'followup', 'manual', '2026-04-09 10:00:00', 'open', 2, NULL, NULL, NOW(), NOW()
FROM customers c WHERE c.company = '上海璞真医疗器械有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.customer_id = c.id AND t.title LIKE '璞真医疗：约注册经理%') LIMIT 1;

INSERT INTO tasks (customer_id, owner_user_id, followup_id, title, type, source, due_at, status, priority, result, done_at, created_at, updated_at)
SELECT c.id, @demo, NULL, '武汉光谷：德国备件 HS 预归类', 'followup', 'manual', '2026-04-04 15:00:00', 'open', 2, NULL, NULL, NOW(), NOW()
FROM customers c WHERE c.company = '武汉光谷激光设备有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM tasks t WHERE t.customer_id = c.id AND t.title LIKE '武汉光谷：德国备件%') LIMIT 1;

-- ---------------------------------------------------------------------------
-- 商机 + 一条待审批（经理账号可批）
-- ---------------------------------------------------------------------------
INSERT INTO opportunities (customer_id, owner_user_id, team_id, stage, title, estimated_amount, currency, expected_close_at, loss_reason, created_at, updated_at)
SELECT c.id, @demo, 1, 'quotation', '江苏宏远 · 2026Q3 伺服扩容项目', 1200000.00, 'CNY', '2026-06-30 00:00:00', NULL, NOW(), NOW()
FROM customers c WHERE c.company = '江苏宏远机电有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM opportunities o WHERE o.customer_id = c.id AND o.title LIKE '江苏宏远 · 2026Q3%') LIMIT 1;

INSERT INTO opportunities (customer_id, owner_user_id, team_id, stage, title, estimated_amount, currency, expected_close_at, loss_reason, created_at, updated_at)
SELECT c.id, @demo, 1, 'quotation', '凯越 · 东南亚合并线年度标', 580000.00, 'USD', '2026-05-15 00:00:00', NULL, NOW(), NOW()
FROM customers c WHERE c.company = '宁波凯越进出口有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM opportunities o WHERE o.customer_id = c.id AND o.title LIKE '凯越 · 东南亚合并线%') LIMIT 1;

INSERT INTO opportunities (customer_id, owner_user_id, team_id, stage, title, estimated_amount, currency, expected_close_at, loss_reason, created_at, updated_at)
SELECT c.id, @demo, 1, 'requirements', '海德水产 · 韩线冷柜年度约价', 900000.00, 'CNY', '2026-04-30 00:00:00', NULL, NOW(), NOW()
FROM customers c WHERE c.company = '青岛海德水产品集团有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM opportunities o WHERE o.customer_id = c.id AND o.title LIKE '海德水产 · 韩线%') LIMIT 1;

INSERT INTO opportunities (customer_id, owner_user_id, team_id, stage, title, estimated_amount, currency, expected_close_at, loss_reason, created_at, updated_at)
SELECT c.id, @demo, 1, 'won', '馨家 · 东欧工程首单（已结案）', 210000.00, 'EUR', '2026-02-01 00:00:00', NULL, NOW(), NOW()
FROM customers c WHERE c.company = '佛山市馨家照明科技有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM opportunities o WHERE o.customer_id = c.id AND o.title LIKE '馨家 · 东欧工程首单%') LIMIT 1;

INSERT INTO opportunities (customer_id, owner_user_id, team_id, stage, title, estimated_amount, currency, expected_close_at, loss_reason, created_at, updated_at)
SELECT c.id, @demo, 1, 'prospecting', '中科芯片 · 晶圆二供导入', 350000.00, 'CNY', '2026-07-01 00:00:00', NULL, NOW(), NOW()
FROM customers c WHERE c.company = '合肥中科芯片应用技术有限公司' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM opportunities o WHERE o.customer_id = c.id AND o.title LIKE '中科芯片 · 晶圆二供%') LIMIT 1;

INSERT INTO opportunities (customer_id, owner_user_id, team_id, stage, title, estimated_amount, currency, expected_close_at, loss_reason, created_at, updated_at)
SELECT c.id, @demo, 1, 'lost', '温州纽扣协会 · 年度框架协议（流标）', 400000.00, 'CNY', '2025-12-20 00:00:00', '价格未中标', NOW(), NOW()
FROM customers c WHERE c.company = '温州市纽扣行业协会采购办公室' AND c.owner_user_id <=> @demo
  AND NOT EXISTS (SELECT 1 FROM opportunities o WHERE o.customer_id = c.id AND o.title LIKE '温州纽扣协会 · 年度框架%') LIMIT 1;

-- 待审批：从 quotation 推进到 negotiation（关联「宏远」商机）
INSERT INTO opportunity_stage_requests (opportunity_id, from_stage, to_stage, requested_by_user_id, status, reason, reject_reason, approved_by_user_id, requested_at, approved_at, updated_at)
SELECT o.id, 'quotation', 'negotiation', @demo, 'pending', '客户口头同意技术方案，申请进入商务谈判锁定账期。', NULL, NULL, NOW(), NULL, NOW()
FROM opportunities o
JOIN customers c ON c.id = o.customer_id AND c.company = '江苏宏远机电有限公司'
WHERE o.title LIKE '江苏宏远 · 2026Q3%'
  AND NOT EXISTS (
    SELECT 1 FROM opportunity_stage_requests r
    WHERE r.opportunity_id = o.id AND r.from_stage = 'quotation' AND r.to_stage = 'negotiation'
  )
LIMIT 1;

-- 同步一条商机动作日志（可选，便于时间线）
INSERT INTO opportunity_actions (opportunity_id, operator_user_id, action, from_stage, to_stage, reason, created_at)
SELECT o.id, @demo, 'seed_note', 'quotation', 'quotation', '演示数据：创建商机', NOW()
FROM opportunities o
JOIN customers c ON c.id = o.customer_id AND c.company = '江苏宏远机电有限公司'
WHERE o.title LIKE '江苏宏远 · 2026Q3%'
  AND NOT EXISTS (SELECT 1 FROM opportunity_actions a WHERE a.opportunity_id = o.id AND a.action = 'seed_note')
LIMIT 1;

-- ---------------------------------------------------------------------------
-- 公海操作日志（演示捞取/投放痕迹，可选）
-- ---------------------------------------------------------------------------
INSERT INTO pool_actions (customer_id, operator_user_id, action, from_owner_user_id, to_owner_user_id, reason, created_at)
SELECT c.id, @demo, 'to_pool', @demo, NULL, 'seed：演示转公海流水', '2026-03-14 10:00:00'
FROM customers c WHERE c.company = '广州某五金商行（未认证）' AND c.pool_status = 'pool'
  AND NOT EXISTS (SELECT 1 FROM pool_actions pa WHERE pa.customer_id = c.id AND pa.reason = 'seed：演示转公海流水')
LIMIT 1;
