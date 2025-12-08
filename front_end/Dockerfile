FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Xoá nội dung default của Nginx
RUN rm -rf ./*

# Copy thư mục build (đã được build sẵn ở máy dev hoặc CI) vào image
COPY build/ ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
