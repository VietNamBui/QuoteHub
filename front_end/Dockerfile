# Build React app
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

# Tăng giới hạn bộ nhớ cho Node.js để tránh lỗi "JavaScript heap out of memory" khi build
ENV NODE_OPTIONS="--max_old_space_size=2048"
RUN npm run build

# Serve build bằng Nginx
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
