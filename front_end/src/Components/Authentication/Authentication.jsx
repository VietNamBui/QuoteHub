import { Button, Grid, Typography, Box, Stack, Paper, Chip, Divider } from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import React, { useState } from "react";
import AuthModal from "./AuthModel";

const Authentication = () => {
  const [openAuthModel, setOpenAuthModel] = useState(false);
  const [authMode, setAuthMode] = useState("signin");

  const handleOpenAuthModel = (mode = "signin") => {
    setAuthMode(mode);
    setOpenAuthModel(true);
  };
  const handleCloseAuthModel = () => setOpenAuthModel(false);

  const highlightStats = [
    { label: "Trích dẫn được cá nhân hóa", value: "12k+" },
    { label: "Tác giả truyền cảm hứng", value: "3.5k" },
    { label: "Phiên đọc mỗi ngày", value: "54k" },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fdfdfd",
        color: "#0f172a",
        py: { xs: 8, md: 12 },
        px: { xs: 3, md: 10 },
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(37,99,235,0.08), transparent 40%), radial-gradient(circle at 80% 0%, rgba(16,185,129,0.1), transparent 35%)",
      }}
    >
      <Grid container spacing={8} alignItems="center">
        <Grid item md={6} xs={12}>
          <Stack spacing={4}>
            <Chip
              label="Thế hệ mới của việc đọc & cảm hứng"
              sx={{
                alignSelf: "flex-start",
                bgcolor: "rgba(37,99,235,0.1)",
                color: "#1d4ed8",
                fontWeight: 600,
                letterSpacing: 0.4,
              }}
            />
            <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.1, color: "#0f172a" }}>
              Khơi nguồn cảm hứng từ mỗi câu chữ.
            </Typography>
            <Typography variant="h6" sx={{ color: "rgba(15,23,42,0.7)", maxWidth: 520 }}>
              QuoteHub giúp bạn lưu giữ và khám phá những trích dẫn hay nhất từ sách, podcast
              và những người bạn ngưỡng mộ. Tham gia cộng đồng hàng nghìn người yêu tri thức.
            </Typography>

            <Grid container spacing={3}>
              {highlightStats.map((item) => (
                <Grid item xs={4} key={item.label}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>
                    {item.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.6)" }}>
                    {item.label}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                onClick={() => handleOpenAuthModel("signup")}
                sx={{
                  textTransform: "none",
                  borderRadius: "18px",
                  px: 5,
                  py: 2,
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  boxShadow: "0 15px 35px rgba(0, 212, 255, 0.35)",
                  bgcolor: "#00d4ff",
                  color: "#051937",
                }}
              >
                Bắt đầu ngay
              </Button>
              <Button
                variant="text"
                size="large"
                sx={{ color: "rgba(15,23,42,0.7)", textTransform: "none" }}
                onClick={() => handleOpenAuthModel("signup")}
              >
                Xem cộng đồng hoạt động
              </Button>
            </Stack>
          </Stack>
        </Grid>

        <Grid item md={6} xs={12}>
          <Paper
            elevation={10}
            sx={{
              p: { xs: 4, md: 5 },
              borderRadius: 5,
              background: "#ffffff",
              border: "1px solid rgba(15,23,42,0.08)",
            }}
          >
            <Stack spacing={3}>
              <div>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
                  Đăng nhập nhanh với Google
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.6)" }}>
                  Tận hưởng trải nghiệm đồng bộ và bảo mật tuyệt đối.
                </Typography>
              </div>

              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <GoogleLogin
                  width={330}
                  onSuccess={(credentialResponse) => console.log("Google login thành công", credentialResponse)}
                  onError={() => console.log("Google login thất bại")}
                />
              </Box>

              <Divider sx={{ borderColor: "rgba(15,23,42,0.08)" }}>hoặc</Divider>

              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => handleOpenAuthModel("signup")}
                  sx={{
                    borderRadius: "16px",
                    py: 1.8,
                    textTransform: "none",
                    fontWeight: 600,
                    bgcolor: "#2563eb",
                    boxShadow: "0 12px 24px rgba(37, 99, 235, 0.35)",
                  }}
                >
                  Tạo tài khoản QuoteHub
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => handleOpenAuthModel("signin")}
                  sx={{
                    borderRadius: "16px",
                    py: 1.8,
                    textTransform: "none",
                    fontWeight: 600,
                    color: "#0f172a",
                    borderColor: "rgba(15,23,42,0.2)",
                  }}
                >
                  Tôi đã có tài khoản
                </Button>
              </Stack>

              <Typography variant="caption" sx={{ color: "rgba(15,23,42,0.6)", textAlign: "center" }}>
                Khi tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách quyền riêng tư của QuoteHub.
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
      <AuthModal
        open={openAuthModel}
        handleClose={handleCloseAuthModel}
        mode={authMode}
        onChangeMode={setAuthMode}
      />
    </Box>
  );
};

export default Authentication;
