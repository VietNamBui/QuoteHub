import { Button, Grid, Typography, Box, Stack, Paper, Chip, Divider } from "@mui/material";
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

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fdfdfd",
        color: "#0f172a",
        px: { xs: 3, md: 4 },
        backgroundImage:
          "radial-gradient(circle at 20% 20%, rgba(37,99,235,0.08), transparent 40%), radial-gradient(circle at 80% 0%, rgba(16,185,129,0.1), transparent 35%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Grid container spacing={6} alignItems="center" justifyContent="center">
        <Grid item md={6} xs={12}>
          <Stack spacing={4} alignItems="center">
            <Chip
              label="Thế hệ mới của việc đọc & cảm hứng"
              sx={{
                bgcolor: "rgba(37,99,235,0.1)",
                color: "#1d4ed8",
                fontWeight: 600,
                letterSpacing: 0.4,
              }}
            />
            <Typography
              variant="h2"
              sx={{ fontWeight: 800, lineHeight: 1.1, color: "#0f172a", textAlign: "center" }}
            >
              Khơi nguồn cảm hứng từ mỗi câu chữ.
            </Typography>

            <Paper
              elevation={10}
              sx={{
                mt: 2,
                width: "100%",
                maxWidth: 480,
                p: { xs: 4, md: 5 },
                borderRadius: 5,
                background: "#ffffff",
                border: "1px solid rgba(15,23,42,0.08)",
              }}
            >
              <Stack spacing={3}>
                <div>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
                    Tham gia QuoteHub
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.6)" }}>
                    Đăng ký hoặc đăng nhập bằng email để bắt đầu lưu trữ các trích dẫn.
                  </Typography>
                </div>

                <Divider sx={{ borderColor: "rgba(15,23,42,0.08)" }} />

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

                <Typography
                  variant="caption"
                  sx={{ color: "rgba(15,23,42,0.6)", textAlign: "center" }}
                >
                  Khi tiếp tục, bạn đồng ý với Điều khoản dịch vụ và Chính sách quyền riêng tư của
                  QuoteHub.
                </Typography>
              </Stack>
            </Paper>
          </Stack>
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
