import { Grid } from "@mui/material";
import React from "react";
import Navigation from "../Navigation/Navigation";
import HomeSection from "../HomeSection/HomeSection";
import RightPart from "../RightPart/RightPart";
import { Route, Routes } from "react-router-dom";
import Profile from "../Profile/Profile";
import TwitDetais from "../TwitDetails/TwitDetais";

const HomePage = () => {
  return (
    <Grid container className="px-5 lg:px-36 justify-between">
      {/* Left Part */}
      <Grid item xs={12} lg={3} className="p-4">
        <Navigation />
      </Grid>

      {/* Middle Part */}
      <Grid item xs={12} lg={6} className="p-4 px-5 lg:px-9">
        <Routes>
          <Route path="/" element={<HomeSection />}></Route>
          <Route path="/home" element={<HomeSection />}></Route>
          <Route path="/profile/:id" element={<Profile />}></Route>  
          <Route path="/twit/:id" element={<TwitDetais />}></Route> 
        </Routes>
        
      </Grid>

      {/* Right Part */}
      <Grid item xs={12} lg={3} className="p-4">
        <RightPart />
      </Grid>
    </Grid>
  );
};

export default HomePage;
