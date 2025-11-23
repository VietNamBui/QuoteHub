import {
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { blue, grey } from "@mui/material/colors";
import { useFormik } from "formik";
import React from "react";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { registerUser } from "../../Store/Auth/Action";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Email không hợp lệ!")
    .required("Bắt buộc phải nhập email"),
  password: Yup.string()
    .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
    .required("Bắt buộc nhập mật khẩu!"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Mật khẩu không trùng khớp!")
    .required("Bắt buộc phải nhập lại mật khẩu"),
});

const SignupForm = () => {
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: (values) => {
      const sendData = {
        email: values.email,
        password: values.password,
      };

      dispatch(registerUser(sendData));
      console.log("Dữ liệu gửi API: ", sendData);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack spacing={3}>
        {/* EMAIL */}
        <div>
          <Typography variant="subtitle2" sx={{ color: grey[600], mb: 0.5 }}>
            Email
          </Typography>
          <TextField
            fullWidth
            placeholder="tenban@example.com"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />
        </div>

        {/* PASSWORD */}
        <div>
          <Typography variant="subtitle2" sx={{ color: grey[600], mb: 0.5 }}>
            Mật khẩu
          </Typography>
          <TextField
            fullWidth
            type="password"
            placeholder="Ít nhất 8 ký tự"
            name="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
        </div>

        {/* CONFIRM PASSWORD */}
        <div>
          <Typography variant="subtitle2" sx={{ color: grey[600], mb: 0.5 }}>
            Nhập lại mật khẩu
          </Typography>
          <TextField
            fullWidth
            type="password"
            placeholder="Nhập lại mật khẩu"
            name="confirmPassword"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.confirmPassword &&
              Boolean(formik.errors.confirmPassword)
            }
            helperText={
              formik.touched.confirmPassword && formik.errors.confirmPassword
            }
          />
        </div>

        <Button
          sx={{
            borderRadius: "18px",
            py: "14px",
            bgcolor: blue[500],
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 700,
          }}
          type="submit"
          fullWidth
          variant="contained"
        >
          Đăng ký tài khoản
        </Button>
      </Stack>
    </form>
  );
};

export default SignupForm;
