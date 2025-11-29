import { Box, Paper } from "@mui/material";
import React from "react";
import Navigation from "../Navigation/Navigation";
import HomeSection from "../HomeSection/HomeSection";
import RightPart from "../RightPart/RightPart";
import NotificationPage from "../Notification/NotificationPage";
import CommunitiesPage from "../Communities/CommunitiesPage";
import { Route, Routes } from "react-router-dom";
import Profile from "../Profile/Profile";
import TwitDetais from "../TwitDetails/TwitDetais";
import MorePage from "../More/MorePage";
import BookQuotesPage from "../More/BookQuotesPage";
import LabelQuotesPage from "../More/LabelQuotesPage";

const HomePage = () => {
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
            <Navigation />
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
              <Route path="/" element={<HomeSection />}></Route>
              <Route path="/home" element={<HomeSection />}></Route>
              <Route path="/notification" element={<NotificationPage />}></Route>
              <Route path="/communities" element={<CommunitiesPage />}></Route>
              <Route path="/profile/:id" element={<Profile />}></Route>
              <Route path="/twit/:id" element={<TwitDetais />}></Route>
              <Route path="/more" element={<MorePage />}></Route>
              <Route path="/more/books/:bookId" element={<BookQuotesPage />}></Route>
              <Route path="/more/labels/:labelId" element={<LabelQuotesPage />}></Route>
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
            <RightPart />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
