import React, { useEffect, useState } from "react";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useNavigate, useParams } from "react-router-dom";
import { Avatar, Box, Button, Tab, Tabs } from "@mui/material";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import TweetCard from "../HomeSection/TweetCard";
import ProfileModel from "./ProfileModal";
import { useDispatch, useSelector } from "react-redux";
import { store } from "../../Store/store";
import { findUserById, followUserAction } from "../../Store/Auth/Action";
import { getUsersTweet, findTwitsByLikeContaineUser, findUserReplies } from "../../Store/Twit/Action";

const Profile = () => {
  const [tabValue, setTabValue] = useState("1");
  const navigate = useNavigate();
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const handleOpenProfileModel = () => setOpenProfileModal(true);
  const handleClose = () => setOpenProfileModal(false);
  const { auth,twit } = useSelector((store) => store);
  const dispatch=useDispatch()
  const {id}=useParams()

  const handleBack = () => navigate(-1);

  const handleFollowUser = () => {
    dispatch(followUserAction(id))
    console.log("follow user");
  };
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);

    if (newValue === "4") {
      // Load danh sách twit mà user này đã like
      dispatch(findTwitsByLikeContaineUser(id));
    } else if (newValue === "2") {
      // Các twit mà user đã reply
      dispatch(findUserReplies(id));
    } else if (newValue === "1") {
      // Twits của user
      dispatch(getUsersTweet(id));
    }
  };

  useEffect(()=>{
dispatch(findUserById(id))
dispatch(getUsersTweet(id))
  },[id])

  return (
    <div>
      <section
        className={`bg-white z-50 flex items-center sticky top-0 bg-opacity-95`}
      >
        <KeyboardBackspaceIcon
          className="cursor-pointer"
          onClick={handleBack}
        />

        <p className="py-5 text-xl font-bold opacity-90 ml-5">
          {auth.findUser?.fullName}
        </p>
      </section>

      <section>
        <img
          className="w-[100%] h-[15rem] object-cover"
          src={
            auth.findUser?.backgroundImage
              ? `http://localhost:5454${auth.findUser.backgroundImage}`
              : "https://i.pinimg.com/736x/49/4d/3b/494d3b4fc5dd4a1c83820a6b0598c462.jpg"
          }
          alt="background"
        />
      </section>
      <section className="pl-6">
        <div className="flex justify-between items-start mt-5 h-[5rem]">
          <Avatar
            className="transform -translate-y-24"
            alt={auth.findUser?.fullName || "avatar"}
            src={
              auth.findUser?.image
                ? `http://localhost:5454${auth.findUser.image}`
                : undefined
            }
            sx={{ width: "10rem", height: "10rem", border: "4px solid white" }}
          />
          {auth.findUser?.req_user ? (
            <Button
              onClick={handleOpenProfileModel}
              variant="contained"
              sx={{ borderRadius: "20px" }}
            >
              Edit Profile
            </Button>
          ) : (
            <Button
              onClick={handleFollowUser}
              variant="contained"
              sx={{ borderRadius: "20px" }}
            >
              {auth.findUser?.followed ? "unfollow" : "follow"}
            </Button>
          )}
        </div>
        <div>
          <div className="flex items-center">
            <h1 className="font-bold text-lg">{auth.findUser?.fullName}</h1>
            {true && (
              <img
                className="ml-2 w-5 h-5"
                src="https://i.pinimg.com/736x/2a/50/2a/2a502a0a0fa654983190b5ec57c1532a.jpg"
                alt=""
              />
            )}
          </div>
            <h1 className="text-gray-500">
              @{(auth.findUser?.fullName || "unknown").split("").join("_").toLowerCase()}
            </h1>
        </div>

        <div className="mt-2 space-y-3">
          <p>
            {auth.findUser?.bio}
          </p>
          <div className="py-1 flex space-x-5">
            <div className="flex items-center text-gray-500">
              <BusinessCenterIcon />
              <p className="ml-2">Education</p>
            </div>
            <div className="flex items-center text-gray-500">
              <LocationOnIcon />
              <p className="ml-2">{auth.findUser?.location}</p>
            </div>
            <div className="flex items-center text-gray-500">
              <CalendarMonthIcon />
              <p className="ml-2">Tham gia vao 2025</p>
            </div>
          </div>
          <div className="flex items-center space-x-5">
            <div className="flex items-center space-x-1 font-semibold">
              <span>{auth.findUser?.followings?.length}</span>
              <span className="text-gray-500">Following</span>
            </div>
            <div className="flex items-center space-x-1 font-semibold">
              <span>{auth.findUser?.followers?.length}</span>
              <span className="text-gray-500">Followers</span>
            </div>
          </div>
        </div>
      </section>
      <section className="py-5">
        <Box sx={{ width: "100%", typography: "body1" }}>
          <TabContext value={tabValue}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <TabList
                onChange={handleTabChange}
                aria-label="lab API tabs example"
              >
                <Tab label="Tweets" value="1" />
                <Tab label="Replies" value="2" />
                <Tab label="Media" value="3" />
                <Tab label="Likes" value="4" />
              </TabList>
            </Box>
            <TabPanel value="1">
              {twit.twits.map((item) => (
                <TweetCard item={item}/>
              ))}
            </TabPanel>
            <TabPanel value="2">
              {twit.repliesTwits && twit.repliesTwits.length > 0 ? (
                twit.repliesTwits.map((item) => (
                  <TweetCard key={item.id} item={item} />
                ))
              ) : (
                <p className="text-gray-500">User này chưa trả lời twit nào.</p>
              )}
            </TabPanel>
            <TabPanel value="3">Media</TabPanel>
            <TabPanel value="4">
              {twit.likedTwits && twit.likedTwits.length > 0 ? (
                twit.likedTwits.map((item) => (
                  <TweetCard key={item.id} item={item} />
                ))
              ) : (
                <p className="text-gray-500">User này chưa like twit nào.</p>
              )}
            </TabPanel>
          </TabContext>
        </Box>
      </section>
      <section>
        <ProfileModel handleClose={handleClose} open={openProfileModal} />
      </section>
    </div>
  );
};

export default Profile;
