import { Button, Stack, TextField, Typography, Divider } from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import { useFormik } from "formik";
import React from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { loginUser } from './../../Store/Auth/Action';
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Email không hợp lệ!")
    .required("Bắt buộc phải nhập email"),
  password: Yup.string().required("Bắt buộc nhập mật khẩu!"),
});
const SigninForm = ({ onChangeMode }) => {
  const dispath = useDispatch();
  const navigate = useNavigate();

  const { loading, loginSuccess, pendingEmail } = useSelector((state) => state.auth);



  
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      dispath(loginUser(values))
      console.log("giá trị form", values);
    },
  });
  const fieldCommonProps = {
    fullWidth: true,
    variant: "outlined",
    size: "medium",
    InputLabelProps: { shrink: true },
  };

  useEffect(() => {
    if (loginSuccess) {
      navigate("/home");
    }
  }, [loginSuccess, navigate]);

  // Khi backend yêu cầu 2FA (có pendingEmail), chuyển sang màn hình nhập OTP
  useEffect(() => {
    if (pendingEmail && onChangeMode) {
      onChangeMode("otp");
    }
  }, [pendingEmail, onChangeMode]);

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack spacing={3}>
        <div>
          <Typography variant="subtitle2" sx={{ color: grey[600], fontWeight: 600, mb: 0.5 }}>
            Email
          </Typography>
          <TextField
            {...fieldCommonProps}
            placeholder="tenban@example.com"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </div>

        <div>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="subtitle2" sx={{ color: grey[600], fontWeight: 600 }}>
              Mật khẩu
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: blue[500], cursor: "pointer" }}
              onClick={() => onChangeMode && onChangeMode("forgot")}
            >
              Quên mật khẩu?
            </Typography>
          </Stack>
          <TextField
            {...fieldCommonProps}
            placeholder="Nhập mật khẩu của bạn"
            name="password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
        </div>

        <Divider sx={{ borderStyle: "dashed" }} />

        <Button
          sx={{
            borderRadius: "18px",
            py: "14px",
            bgcolor: blue[500],
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 700,
            boxShadow: "0 10px 22px rgba(33, 150, 243, 0.3)",
          }}
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
        >
          {/* Đăng nhập */}

          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </Stack>
    </form>
  );
};

export default SigninForm;
