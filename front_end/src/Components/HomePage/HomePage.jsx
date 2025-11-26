import { Box, Grid, Paper } from "@mui/material";
import React from "react";
import Navigation from "../Navigation/Navigation";
import HomeSection from "../HomeSection/HomeSection";
import RightPart from "../RightPart/RightPart";
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
        minHeight: "100vh",
        bgcolor: "#f6f7fb",
        backgroundImage:
          "radial-gradient(circle at 10% 20%, rgba(59,130,246,0.08), transparent 35%), radial-gradient(circle at 80% 0%, rgba(16,185,129,0.07), transparent 30%)",
        py: { xs: 2, md: 4 },
      }}
    >
      <Grid
        container
        spacing={{ xs: 2, md: 3 }}
        alignItems="flex-start"
        sx={{ maxWidth: 1200, mx: "auto", px: { xs: 2, md: 0 } }}
      >
        {/* Cột trái: Navigation */}
        <Grid item xs={3} md={3}>
          <Paper
            elevation={6}
            sx={{
              borderRadius: 4,
              p: { xs: 2, md: 2.5 },
              bgcolor: "#ffffff",
              border: "1px solid rgba(15,23,42,0.06)",
            }}
          >
            <Navigation />
          </Paper>
        </Grid>

        {/* Cột giữa: nội dung chính */}
        <Grid item xs={6} md={6}>
          <Paper
            elevation={10}
            sx={{
              borderRadius: 4,
              p: { xs: 1.5, sm: 2, md: 3 },
              bgcolor: "#ffffff",
              border: "1px solid rgba(15,23,42,0.05)",
              width: "100%",
            }}
          >
            <Routes>
              <Route path="/" element={<HomeSection />}></Route>
              <Route path="/home" element={<HomeSection />}></Route>
              <Route path="/profile/:id" element={<Profile />}></Route>
              <Route path="/twit/:id" element={<TwitDetais />}></Route>
              <Route path="/more" element={<MorePage />}></Route>
              <Route path="/more/books/:bookId" element={<BookQuotesPage />}></Route>
              <Route path="/more/labels/:labelId" element={<LabelQuotesPage />}></Route>
            </Routes>
          </Paper>
        </Grid>

        {/* Cột phải: RightPart */}
        <Grid
          item
          xs={3}
          md={3}
        >
          <Paper
            elevation={6}
            sx={{
              borderRadius: 4,
              p: { xs: 2, md: 2.5 },
              // position: { lg: "sticky" },
              // top: 32,
              bgcolor: "#ffffff",
              border: "1px solid rgba(15,23,42,0.06)",
            }}
          >
            <RightPart />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomePage;
