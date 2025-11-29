import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import { api } from "../../config/api";
import { toast } from "react-toastify";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Liên kết đặt lại mật khẩu không hợp lệ");
      return;
    }
    if (!password.trim()) {
      toast.error("Vui lòng nhập mật khẩu mới");
      return;
    }
    if (password !== confirm) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    try {
      setLoading(true);
      await api.post("/auth/reset-password", { token, newPassword: password.trim() });
      toast.success("Đổi mật khẩu thành công. Vui lòng đăng nhập lại.");
      navigate("/", { replace: true });
    } catch (e) {
      console.error("reset password error", e);
      const msg = e.response?.data || "Không thể đặt lại mật khẩu";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f9fafb",
        px: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 4,
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Đặt lại mật khẩu
            </Typography>
            <Typography variant="body2" sx={{ color: grey[600] }}>
              Nhập mật khẩu mới cho tài khoản của bạn.
            </Typography>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Mật khẩu mới"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Xác nhận mật khẩu mới"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 1,
                  borderRadius: "18px",
                  py: "12px",
                  bgcolor: blue[500],
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {loading ? "Đang đặt lại..." : "Đổi mật khẩu"}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ResetPasswordPage;
