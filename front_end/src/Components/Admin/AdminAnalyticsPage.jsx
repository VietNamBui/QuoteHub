import React from "react";
import { Box, Stack, Typography } from "@mui/material";

const AdminAnalyticsPage = () => {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Analytics - Thống kê hệ thống
      </Typography>
      <Stack spacing={1} sx={{ color: "rgba(15,23,42,0.7)" }}>
        <Typography variant="body2">
          Đây là trang phân tích dành cho admin. Sau này bạn có thể hiển thị các
          biểu đồ như:
        </Typography>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          <li>Tổng số bài viết được duyệt / bị từ chối theo ngày</li>
          <li>Số lượng báo cáo người dùng theo loại vi phạm</li>
          <li>Thống kê hoạt động của admin (số bài đã review)</li>
        </ul>
      </Stack>
    </Box>
  );
};

export default AdminAnalyticsPage;
