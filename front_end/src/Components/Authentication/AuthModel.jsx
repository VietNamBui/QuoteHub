import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import { blueGrey, grey } from "@mui/material/colors";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SigninForm from "./SigninForm";
import SignupForm from "./SignupForm";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";


const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "min(900px, 92vw)",
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 5,
  outline: "none",
};

export default function AuthModal({ open, handleClose, mode, onChangeMode }) {
  const isSignup = mode === "signup";

  const featureList = [
    "Khám phá kho trích dẫn được cá nhân hóa",
    "Lưu lại cảm hứng chỉ với một lần chạm",
    "Cập nhật xu hướng đọc mỗi ngày",
  ];

  const { registerSuccess } = useSelector((state) => state.auth);

  useEffect(() => {
    if (registerSuccess) {
      // chuyển sang login sau khi đăng ký thành công
      onChangeMode("signin");
    }
  }, [registerSuccess, onChangeMode]);
  
  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Stack spacing={0} sx={{ position: "relative" }}>
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{
                position: "absolute",
                top: 14,
                right: 14,
                bgcolor: "rgba(255,255,255,0.9)",
                boxShadow: "0 4px 16px rgba(15, 23, 42, 0.15)",
                "&:hover": { bgcolor: "white" },
                zIndex: 2,
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>

            <Box
              sx={{
                background: "linear-gradient(135deg, #eff6ff 0%, #e0f2fe 60%, #f8fafc 100%)",
                color: "#0f172a",
                borderRadius: { xs: "24px 24px 0 0", md: "24px 24px 0 0" },
                p: { md: 5, xs: 4 },
                display: "flex",
                flexDirection: { md: "row", xs: "column" },
                gap: 4,
                alignItems: { md: "center", xs: "flex-start" },
              }}
            >
              <Stack spacing={2} sx={{ flex: 1 }}>
                <Typography variant="overline" sx={{ letterSpacing: 2, color: "#1d4ed8" }}>
                  QuoteHub
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2, color: "#0f172a" }}>
                  Nơi cảm hứng được thắp sáng mỗi ngày
                </Typography>
                <Typography variant="body2" sx={{ color: blueGrey[700], maxWidth: 520 }}>
                  Chọn chế độ đăng nhập phù hợp và bắt đầu ghi dấu hành trình sáng tạo của riêng bạn.
                </Typography>
              </Stack>

              <Stack spacing={2} sx={{ flex: { md: 0.9, xs: 1 } }}>
                {featureList.map((feature) => (
                  <Stack key={feature} direction="row" alignItems="center" spacing={1.5}>
                    <CheckCircleOutlineRoundedIcon fontSize="small" sx={{ color: "#2563eb" }} />
                    <Typography variant="body2" sx={{ color: "#0f172a" }}>
                      {feature}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Box
              sx={{
                p: { md: 5, xs: 4 },
                borderRadius: { xs: "0 0 24px 24px", md: "0 0 24px 24px" },
                backgroundColor: "#fff",
              }}
            >
              <Stack spacing={3}>
                <Stack spacing={1}>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {isSignup ? "Tạo tài khoản mới" : "Chào mừng trở lại"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: grey[600] }}>
                    {isSignup
                      ? "Chỉ mất chưa tới 1 phút để tham gia cộng đồng QuoteHub."
                      : "Đăng nhập để tiếp tục khám phá nguồn cảm hứng mới."}
                  </Typography>
                </Stack>

                {/* {isSignup ? <SignupForm /> : <SigninForm />} */}
                
                {mode === "signup" && <SignupForm />}
                {mode === "signin" && <SigninForm />}


                <Divider textAlign="center" sx={{ color: grey[500] }}>
                  {isSignup ? "Đã có tài khoản?" : "Chưa có tài khoản?"}
                </Divider>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => onChangeMode(isSignup ? "signin" : "signup")}
                  sx={{
                    borderRadius: "18px",
                    py: "12px",
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  {isSignup ? "Chuyển sang đăng nhập" : "Tạo tài khoản mới"}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
}
