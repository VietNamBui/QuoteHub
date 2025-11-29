import React, { useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import { api } from "../../config/api";
import { toast } from "react-toastify";

const ForgotPasswordForm = ({ onBackToSignin }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Vui lòng nhập email của bạn");
      return;
    }
    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email: email.trim() });
      toast.success("Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi.");
      if (onBackToSignin) onBackToSignin();
    } catch (e) {
      console.error("forgot password error", e);
      toast.error("Không thể gửi email đặt lại mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="subtitle2" sx={{ color: grey[600], fontWeight: 600 }}>
            Email
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            size="medium"
            placeholder="tenban@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Typography variant="caption" sx={{ color: grey[500] }}>
            Chúng tôi sẽ gửi cho bạn một liên kết đặt lại mật khẩu qua email này.
          </Typography>
        </Stack>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{
            borderRadius: "18px",
            py: "14px",
            bgcolor: blue[500],
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 700,
            boxShadow: "0 10px 22px rgba(33, 150, 243, 0.3)",
          }}
        >
          {loading ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}
        </Button>
      </Stack>
    </Box>
  );
};

export default ForgotPasswordForm;
