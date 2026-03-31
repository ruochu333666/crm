FROM node:18-alpine

WORKDIR /app

# 复制package文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 编译TypeScript
RUN npm run build

EXPOSE 5174

CMD ["npm", "start"]
