import { Button, Grid } from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import React, { useState } from "react";
import AuthModal from './AuthModel';

const Authentication = () => {
  const [openAuthModel,setOpenAuthModel]=useState(false);
  const handleOpenAuthModel=()=>setOpenAuthModel(true);
  const handleCloseAuthModel=()=>setOpenAuthModel(false);
  return (
    <div>
      <Grid className="overflow-y-hidden" container>
        <Grid className="hidden lg:block" item lg={7}>
          <img
            className="w-full h-screen"
            src="https://i.pinimg.com/736x/94/8f/93/948f93c27356ff90dcdd29cbfb580aca.jpg"
            alt=""
          />
          <div className="absolute top-[26%] left-[19%]">
            <svg
              height="300"
              width="300"
              viewBox="0 0 24 24"
              aria-hidden="true"
              class="r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-1nao33i r-rxcuwo r-1777fci r-m327ed r-494qqr"
            >
              
            </svg>
          </div>
        </Grid>

        <Grid className="px-10" lg={5} xs={12}>
          <h1 className="mt-10 font-bold text-7xl">Đang diễn ra</h1>

          <h1 className="font-bold text-3xl py-16">
            Tham gia Ebook ngay hôm nay
          </h1>

          <div className="w-[60%]">
            <div className="w-full">
              <GoogleLogin width={330} />
              <p className="py-5 text-center">OR</p>

              <Button
              onClick={handleOpenAuthModel}
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  borderRadius: "29px",
                  py: "7px",
                }}
              >
                Tạo tài khoản
              </Button>

              <p className="text-sm mt-2">
                Bằng cách đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính
                sách quyền riêng tư, bao gồm cả việc sử dụng Cookie.
              </p>

              <div className="mt-10">
                <h1 className="font-bold text-xl mb-5">Bạn đã có tài khoản?</h1>
                <Button
                onClick={handleOpenAuthModel}
                  fullWidth
                  variant="outlined"
                  size="large"
                  sx={{
                    borderRadius: "29px",
                    py: "7px",
                  }}
                >
                  Đăng nhập
                </Button>
              </div>
            </div>
          </div>
        </Grid>
      </Grid>
      <AuthModal open={openAuthModel} handleClose={handleCloseAuthModel}/>
    </div>
  );
};

export default Authentication;
