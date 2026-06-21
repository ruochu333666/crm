 CRM 系统

背景：面向中小贸易企业的客户关系管理系统，打通线索-商机-订单全生命周期，结合 AI 赋能提升销售协作效率与资源转化率。

项目简介
本项目旨在解决中小贸易企业在客户资源分布散乱、公海流转规则缺失、商机推进过程难以追溯等痛点。系统基于前后端分离架构开发，提供轻量、易用且具备强业务逻辑的数据管理后台。

 核心业务功能
 客户公海流转：支持客户私海/公海双轨制管理，基于双层时间戳（更新时间与最后跟进时间）设计自动化回收规则（如 15 天未跟进自动入池），提升资源利用率。
 商机漏斗与流转审批：建立从“意向挖掘”到“赢单/输单”的 6 阶段业务流转逻辑，配合销售经理的越级审批机制，实现全过程留痕。
 订单履约追踪： 订单作为商机转化的最终形态，聚合金额、条款、物流等信息，形成闭环管理。
 AI 销售助手：基于 SSE (Server-Sent Events) 流式传输技术，结合客户沟通历史，提供智能跟进策略与对话建议。
 细粒度权限管控：基于 RBAC 模型，精确划分普通销售、团队主管与系统管理员的数据可见性与操作权限。

 技术栈
前端 : React 18, Vite, TypeScript, Zustand, Ant Design, ECharts
后端 :Node.js, Express, JWT (JSON Web Token)
数据库 : MySQL 8.0
部署 : Docker & Docker Compose, Ubuntu

#本地运行

前置环境准备
请确保本地已安装 [Node.js](https://nodejs.org/) (v16+) 和 [MySQL](https://www.mysql.com/) (v8.0+)。

1. 数据库初始化
1. 在 MySQL 中创建数据库：`CREATE DATABASE crm_714one DEFAULT CHARACTER SET utf8mb4;`
2. 导入项目根目录下的 SQL 脚本：`source ./docs/init.sql`

 2. 后端服务运行
```bash
cd backend
# 安装依赖
npm install
# 配置环境变量 (请复制 .env.example 并重命名为 .env，修改数据库配置)
cp .env.example .env
# 启动服务
npm run dev
