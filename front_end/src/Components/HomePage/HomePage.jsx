import { Box, Paper, Stack, Typography, Button, Avatar, Divider } from "@mui/material";
import React, { useEffect, useState } from "react";
import Navigation from "../Navigation/Navigation";
import HomeSection from "../HomeSection/HomeSection";
import RightPart from "../RightPart/RightPart";
import NotificationPage from "../Notification/NotificationPage";
import CommunitiesPage from "../Communities/CommunitiesPage";
import { Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import Profile from "../Profile/Profile";
import TwitDetais from "../TwitDetails/TwitDetais";
import MorePage from "../More/MorePage";
import BookQuotesPage from "../More/BookQuotesPage";
import LabelQuotesPage from "../More/LabelQuotesPage";
import { useDispatch, useSelector } from "react-redux";
import { connectNotificationSocket } from "../../Utils/notificationSocket";
import { toast } from "react-toastify";
import { logout } from "../../Store/Auth/Action";
import { api } from "../../config/api";
import AdminModerationPage from "../Admin/AdminModerationPage";
import AdminAnalyticsPage from "../Admin/AdminAnalyticsPage";

const HomePage = () => {
  const { auth } = useSelector((store) => store);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminView = auth.user?.admin && location.pathname.startsWith("/admin");

  const [adminStats, setAdminStats] = useState(null); // { moderation: {...}, reports: {...} }

  // Kết nối WebSocket để nhận thông báo realtime
  useEffect(() => {
    const userId = auth.user?.id;
    if (!userId) return;

    const disconnect = connectNotificationSocket(userId, (notification) => {
      console.log("[WS] Notification received:", notification);
      // Cập nhật Redux
      dispatch({ type: "NOTIFICATION_PUSHED", payload: notification });

      // Hiện toast đơn giản
      const sender = notification.senderName || "Người dùng";
      let msg = "Hoạt động mới";
      if (notification.type === "LIKE") {
        msg = `${sender} đã thích bài viết của bạn`;
      } else if (notification.type === "REPLY") {
        msg = `${sender} đã bình luận vào bài viết của bạn`;
      } else if (notification.type === "FOLLOW") {
        msg = `${sender} đã theo dõi bạn`;
      } else if (notification.type === "NEW_TWIT") {
        msg = `${sender} vừa đăng một bài viết mới`;
      }
      toast.info(msg);
    });

    return () => {
      disconnect && disconnect();
    };
  }, [auth.user, dispatch]);

  // Load tóm tắt analytics nhẹ cho panel bên phải khi là admin
  useEffect(() => {
    if (!isAdminView) return;
    const fetchAdminStats = async () => {
      try {
        const res = await api.get("/api/admin/analytics");
        setAdminStats(res.data || {});
      } catch (e) {
        console.error("Không thể tải thống kê admin", e);
      }
    };
    fetchAdminStats();
  }, [isAdminView]);


  return (
    <Box
      sx={{
        height: "100vh", // toàn bộ trang cao đúng 1 màn hình
        bgcolor: "#f6f7fb",
        backgroundImage:
          "radial-gradient(circle at 10% 20%, rgba(59,130,246,0.08), transparent 35%), radial-gradient(circle at 80% 0%, rgba(16,185,129,0.07), transparent 30%)",
        py: { xs: 2, md: 4 },
        overflow: "hidden", // chặn scroll body, chỉ scroll bên trong block giữa
      }}
    >
      <Box
        sx={{
          width: "100vw",              // dùng toàn bộ chiều rộng viewport
          mx: 0,
          px: { xs: 3, md: 3 },        // ~24px padding hai bên ngoài (gấp đôi lần nữa)
          display: "flex",
          alignItems: "stretch",
          gap: { xs: 1.5, md: 2 },     // khoảng cách giữa các cột
          height: "100%", // 3 cột cao bằng nhau
        }}
      >
        {/* Cột trái: Navigation */}
        <Box
          sx={{
            flex: "0 0 260px",
            height: "100%",
          }}
        >
          <Paper
            elevation={6}
            sx={{
              borderRadius: 4,
              p: { xs: 2, md: 2.5 },
              bgcolor: "#ffffff",
              border: "1px solid rgba(15,23,42,0.06)",
              height: "100%", // cao bằng cột giữa
              overflow: "hidden", // không cho scroll riêng cột trái
              display: "flex",
              flexDirection: "column",
              justifyContent: "center", // căn giữa nội dung theo chiều dọc
            }}
          >
            {isAdminView ? (
              <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Bảng điều khiển Admin
                </Typography>
                <Stack spacing={1}>
                  <Button
                    size="small"
                    variant={location.pathname.startsWith("/admin/moderation") ? "contained" : "text"}
                    onClick={() => navigate("/admin/moderation")}
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "none",
                      borderRadius: 2,
                    }}
                  >
                    Moderation
                  </Button>
                  <Button
                    size="small"
                    variant={location.pathname.startsWith("/admin/analytics") ? "contained" : "text"}
                    onClick={() => navigate("/admin/analytics")}
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "none",
                      borderRadius: 2,
                    }}
                  >
                    Analytics
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Navigation />
            )}
          </Paper>
        </Box>

        {/* Cột giữa: nội dung chính */}
        <Box
          sx={{
            flex: "1 0 0",            // cho phép block giữa chiếm toàn bộ phần còn lại
            height: "100%",
          }}
        >
          <Paper
            elevation={10}
            sx={{
              borderRadius: 4,
              p: { xs: 1.5, sm: 2, md: 3 },
              bgcolor: "#ffffff",
              border: "1px solid rgba(15,23,42,0.05)",
              width: "100%",
              height: "100%",
              overflowY: "auto", // chỉ block giữa cuộn theo nội dung
            }}
          >
            <Routes>
              <Route
                path="/"
                element={
                  auth.user?.admin ? (
                    <Navigate to="/admin/moderation" replace />
                  ) : (
                    <HomeSection />
                  )
                }
              ></Route>
              <Route
                path="/home"
                element={
                  auth.user?.admin ? (
                    <Navigate to="/admin/moderation" replace />
                  ) : (
                    <HomeSection />
                  )
                }
              ></Route>
              <Route path="/notification" element={<NotificationPage />}></Route>
              <Route path="/communities" element={<CommunitiesPage />}></Route>
              <Route path="/profile/:id" element={<Profile />}></Route>
              <Route path="/twit/:id" element={<TwitDetais />}></Route>
              <Route path="/more" element={<MorePage />}></Route>
              <Route path="/more/books/:bookId" element={<BookQuotesPage />}></Route>
              <Route path="/more/labels/:labelId" element={<LabelQuotesPage />}></Route>
              <Route
                path="/admin/moderation"
                element={
                  auth.user?.admin ? <AdminModerationPage /> : <Navigate to="/home" replace />
                }
              ></Route>
              <Route
                path="/admin/analytics"
                element={
                  auth.user?.admin ? <AdminAnalyticsPage /> : <Navigate to="/home" replace />
                }
              ></Route>
            </Routes>
          </Paper>
        </Box>

        {/* Cột phải: RightPart */}
        <Box
          sx={{
            flex: "0 0 300px",
            display: { xs: "none", md: "block" },
            height: "100%",
          }}
        >
          <Paper
            elevation={6}
            sx={{
              borderRadius: 4,
              p: { xs: 2, md: 2.5 },
              bgcolor: "#ffffff",
              border: "1px solid rgba(15,23,42,0.06)",
              height: "100%", // cao bằng cột giữa
              overflow: "hidden", // không scroll riêng cột phải
              display: "flex",
              flexDirection: "column",
              justifyContent: "center", // căn giữa nội dung theo chiều dọc
            }}
          >
            {isAdminView ? (
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    alt={auth.user?.fullName || auth.user?.email || "A"}
                    src={(() => {
                      const img = auth.user?.image;
                      if (!img) return undefined;
                      return img.startsWith("/") ? `http://localhost:5454${img}` : img;
                    })()}
                  >
                    {!auth.user?.image && (auth.user?.fullName || auth.user?.email)
                      ? (auth.user.fullName || auth.user.email).trim().charAt(0).toUpperCase()
                      : null}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {auth.user?.fullName || "Quản trị viên"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.75)" }}>
                      {auth.user?.email}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 0.5,
                        px: 1,
                        py: 0.3,
                        borderRadius: 999,
                        bgcolor: "#eff6ff",
                        color: "#1d4ed8",
                        display: "inline-block",
                      }}
                    >
                      Admin · Moderation
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.7)" }}>
                  Bạn đang đăng nhập với quyền quản trị. Tại đây có thể theo dõi trạng thái kiểm
                  duyệt, báo cáo người dùng và các số liệu phân tích hệ thống.
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ pt: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => dispatch(logout())}
                    sx={{
                      alignSelf: "flex-start",
                      textTransform: "none",
                      mt: 1,
                      borderRadius: 2,
                    }}
                  >
                    Đăng xuất
                  </Button>
                </Box>
              </Stack>
            ) : (
              <RightPart />
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
