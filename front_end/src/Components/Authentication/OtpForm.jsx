import { Button, Stack, TextField, Typography } from "@mui/material";
import { grey } from "@mui/material/colors";
import { useFormik } from "formik";
import * as Yup from "yup";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { API_BASE_URL } from "../../config/api";
import { toast } from "react-toastify";
import { getUserProfile } from "../../Store/Auth/Action";

const validationSchema = Yup.object().shape({
  code: Yup.string()
    .required("Bắt buộc nhập mã OTP")
    .matches(/^\d{6}$/, "Mã OTP gồm 6 chữ số"),
});

const OtpForm = ({ onBackToSignin }) => {
  const dispatch = useDispatch();
  const { pendingEmail, loading } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: { code: "" },
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (!pendingEmail) {
          toast.error("Thiếu thông tin email để xác thực");
          return;
        }
        const { data } = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
          email: pendingEmail,
          code: values.code,
        });

        if (data.jwt) {
          localStorage.setItem("jwt", data.jwt);
          dispatch({ type: "LOGIN_SUCCESS", payload: data });
          dispatch(getUserProfile(data.jwt));
          toast.success("Đăng nhập thành công");
        }
      } catch (error) {
        const msg = error.response?.data?.message || "Mã OTP không hợp lệ";
        toast.error(msg);
        dispatch({ type: "LOGIN_FAIL", payload: msg });
      }
    },
  });

  const fieldCommonProps = {
    fullWidth: true,
    variant: "outlined",
    size: "medium",
    InputLabelProps: { shrink: true },
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack spacing={3}>
        <div>
          <Typography
            variant="subtitle2"
            sx={{ color: grey[600], fontWeight: 600, mb: 0.5 }}
          >
            Mã xác thực (OTP)
          </Typography>
          <TextField
            {...fieldCommonProps}
            placeholder="Nhập mã 6 chữ số"
            name="code"
            value={formik.values.code}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.code && Boolean(formik.errors.code)}
            helperText={formik.touched.code && formik.errors.code}
          />
        </div>

        <Stack direction="row" justifyContent="space-between">
          <Button
            variant="text"
            onClick={onBackToSignin}
            sx={{ textTransform: "none" }}
          >
            Quay lại đăng nhập
          </Button>
        </Stack>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{ borderRadius: "18px", py: "14px" }}
        >
          Xác nhận mã OTP
        </Button>
      </Stack>
    </form>
  );
};

export default OtpForm;
