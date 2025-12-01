import React, { useEffect, useState } from "react";
import { Box, Stack, Typography, Paper, LinearProgress, Grid } from "@mui/material";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import { connectAnalyticsSocket } from "../../Utils/analyticsSocket";

const StatCard = ({ label, value }) => (
  <Paper
    elevation={2}
    sx={{ p: 2, borderRadius: 3, bgcolor: "#f9fafb", border: "1px solid rgba(15,23,42,0.04)" }}
  >
    <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.6)", mb: 0.5 }}>
      {label}
    </Typography>
    <Typography variant="h6" sx={{ fontWeight: 700 }}>
      {value}
    </Typography>
  </Paper>
);

const ColumnChart = ({ items }) => {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="flex-end"
      sx={{ mt: 1, minHeight: 140 }}
    >
      {items.map((item) => {
        const height = max > 0 ? (item.value / max) * 100 : 0;
        return (
          <Stack
            key={item.label}
            spacing={0.5}
            alignItems="center"
            sx={{ flex: 1, minWidth: 0 }}
          >
            <Typography variant="caption" sx={{ color: "rgba(15,23,42,0.7)" }}>
              {item.value}
            </Typography>
            <Box
              sx={{
                width: "60%",
                height: `${height}%`,
                minHeight: item.value > 0 ? 8 : 2,
                borderRadius: 1.5,
                bgcolor: item.color || "#2563eb",
                transition: "height 0.3s ease",
              }}
            />
            <Typography
              variant="caption"
              sx={{
                textAlign: "center",
                whiteSpace: "normal",
                wordBreak: "break-word",
                color: "rgba(15,23,42,0.8)",
              }}
            >
              {item.label}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
};

const AdminAnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async (showLoading = false) => {
      try {
        if (showLoading) setLoading(true);
        const jwt = localStorage.getItem("jwt");
        const res = await axios.get(`${API_BASE_URL}/api/admin/analytics`, {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        setData(res.data);
      } catch (e) {
        console.error("Failed to load analytics", e);
      } finally {
        if (showLoading) setLoading(false);
      }
    };

    // Lần đầu load có spinner
    fetchData(true);

    // Kết nối WebSocket lắng nghe sự kiện analytics cập nhật
    const disconnect = connectAnalyticsSocket(() => {
      fetchData(false);
    });

    return () => {
      disconnect && disconnect();
    };
  }, []);

  const moderation = data?.moderation || {};
  const reports = data?.reports || {};

  if (loading && !data) {
    return (
      <Box>
        <Typography variant="h6">Đang tải thống kê...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Analytics - Thống kê hệ thống
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard label="Tổng số người dùng" value={data?.totalUsers ?? "-"} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Tổng số bài viết" value={moderation.totalTwits ?? "-"} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Tổng số báo cáo" value={reports.totalReports ?? "-"} />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
              Trạng thái kiểm duyệt bài viết
            </Typography>
            <ColumnChart
              items={[
                { label: "Đã duyệt", value: moderation.approved || 0, color: "#22c55e" },
                { label: "Đang chờ", value: moderation.pending || 0, color: "#facc15" },
                { label: "Từ chối", value: moderation.rejected || 0, color: "#f97316" },
                { label: "Bị chặn", value: moderation.blocked || 0, color: "#ef4444" },
              ]}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2.5, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1.5 }}>
              Thống kê báo cáo & nghi ngờ
            </Typography>
            <ColumnChart
              items={[
                {
                  label: "Bài có report PENDING",
                  value: moderation.reportedPending || 0,
                  color: "#0ea5e9",
                },
                {
                  label: "Báo cáo chờ xử lý",
                  value: reports.pendingReports || 0,
                  color: "#f97316",
                },
                {
                  label: "Báo cáo đã xử lý",
                  value: reports.resolvedReports || 0,
                  color: "#22c55e",
                },
              ]}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminAnalyticsPage;
