import { Box, Grid, Paper } from "@mui/material";
import React from "react";
import Navigation from "../Navigation/Navigation";
import HomeSection from "../HomeSection/HomeSection";
import RightPart from "../RightPart/RightPart";
import { Route, Routes } from "react-router-dom";
import Profile from "../Profile/Profile";
import TwitDetais from "../TwitDetails/TwitDetais";

const HomePage = () => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f6f7fb",
        backgroundImage:
          "radial-gradient(circle at 10% 20%, rgba(59,130,246,0.08), transparent 35%), radial-gradient(circle at 80% 0%, rgba(16,185,129,0.07), transparent 30%)",
        py: { xs: 4, md: 6 },
        px: { xs: 2, lg: 10 },
      }}
    >
      <Grid container spacing={{ xs: 4, md: 3 }} justifyContent="center">
        <Grid item xs={12} lg={2} xl={2} sx={{ maxWidth: { lg: 240, xl: 260 } }}>
          <Paper
            elevation={6}
            sx={{
              borderRadius: 4,
              p: { xs: 2, md: 2.5 },
              position: { lg: "sticky" },
              top: 32,
              bgcolor: "#ffffff",
              border: "1px solid rgba(15,23,42,0.06)",
              maxWidth: { lg: 280 },
              mx: "auto",
            }}
          >
            <Navigation />
          </Paper>
        </Grid>

        <Grid
          item
          xs={12}
          lg={9}
          xl={10}
          sx={{
            flexGrow: 1,
          }}
        >
          <Paper
            elevation={10}
            sx={{
              borderRadius: 4,
              p: { xs: 1.5, sm: 2.5, md: 4 },
              bgcolor: "#ffffff",
              border: "1px solid rgba(15,23,42,0.05)",
              minHeight: "80vh",
              width: "100%",
            }}
          >
            <Routes>
              <Route path="/" element={<HomeSection />}></Route>
              <Route path="/home" element={<HomeSection />}></Route>
              <Route path="/profile/:id" element={<Profile />}></Route>
              <Route path="/twit/:id" element={<TwitDetais />}></Route>
            </Routes>
          </Paper>
        </Grid>

        <Grid
          item
          xs={12}
          lg={3}
          xl={2}
          sx={{ maxWidth: { lg: 280, xl: 320 } }}
          display={{ xs: "none", md: "block" }}
        >
          <Paper
            elevation={6}
            sx={{
              borderRadius: 4,
              p: { xs: 2, md: 2.5 },
              position: { lg: "sticky" },
              top: 32,
              bgcolor: "#ffffff",
              border: "1px solid rgba(15,23,42,0.06)",
              maxWidth: { lg: 320 },
              mx: "auto",
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
