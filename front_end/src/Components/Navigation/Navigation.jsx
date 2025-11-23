import React from "react";
import { navigationMenu } from "./NavigationMenu";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import LaunchIcon from "@mui/icons-material/Launch";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../Store/Auth/Action";

const Navigation = () => {
  const { auth } = useSelector((store) => store);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    dispatch(logout());
  };

  const handleNavigate = (item) => {
    if (item.title === "Profile") {
      navigate(`/profile/${auth.user?.id}`);
    } else {
      navigate(item.path);
    }
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={2}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            fontWeight: 700,
            color: "#0f172a",
          }}
        >
          <Box
            component="span"
            sx={{
              width: 36,
              height: 36,
              borderRadius: "14px",
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <svg
              height="22"
              width="22"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="#0f172a"
            >
              <path d="M21.742 21.75l-7.563-11.179 7.056-8.321h-2.456l-5.691 6.714-4.54-6.714H2.359l7.29 10.776L2.25 21.75h2.456l6.035-7.118 4.818 7.118h6.191-.008zM7.739 3.818L18.81 20.182h-2.447L5.29 3.818h2.447z"></path>
            </svg>
          </Box>
          <Typography variant="h6" sx={{ letterSpacing: 0.8 }}>
            QuoteHub
          </Typography>
        </Box>
        <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.6)" }}>
          Khám phá bảng điều khiển và bắt kịp mọi câu chuyện đang diễn ra.
        </Typography>
      </Stack>

      <List sx={{ px: 0 }}>
        {navigationMenu.map((item) => {
          const IconComponent = item.icon;
          const isActive =
            item.title === "Profile"
              ? location.pathname.includes("/profile")
              : location.pathname === item.path;
          return (
            <ListItemButton
              key={item.title}
              onClick={() => handleNavigate(item)}
              sx={{
                borderRadius: 3,
                mb: 1,
                bgcolor: isActive ? "rgba(37, 99, 235, 0.12)" : "transparent",
                border: isActive ? "1px solid rgba(59,130,246,0.3)" : "1px solid transparent",
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: "#0f172a" }}>
                <IconComponent />
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{ color: "#0f172a", fontWeight: isActive ? 700 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Button
        variant="contained"
        endIcon={<LaunchIcon />}
        sx={{
          borderRadius: 3,
          py: 1.7,
          textTransform: "none",
          fontSize: "1rem",
          fontWeight: 700,
          bgcolor: "#2563eb",
          boxShadow: "0 12px 24px rgba(37, 99, 235, 0.25)",
        }}
      >
        Viết cảm hứng mới
      </Button>

      <Divider sx={{ borderColor: "rgba(15,23,42,0.08)" }} />

      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          p: 1.5,
          borderRadius: 3,
          bgcolor: "rgba(248,250,252,0.9)",
          border: "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <Avatar
          alt="username"
          src="https://i.pinimg.com/736x/2a/50/2a/2a502a0a0fa654983190b5ec57c1532a.jpg"
        />
        <Box flex={1}>
          <Typography sx={{ color: "#0f172a", fontWeight: 600 }}>
            {auth.user?.fullName || "Thành viên QuoteHub"}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.6)" }}>
            @{(auth.user?.fullName || "")
              .split(" ")
              .join("_")
              .toLowerCase()}
          </Typography>
        </Box>
        <IconButton
          id="basic-button"
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
          onClick={handleClick}
          sx={{ color: "#0f172a" }}
        >
          <MoreHorizIcon />
        </IconButton>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          slotProps={{
            list: {
              "aria-labelledby": "basic-button",
            },
          }}
        >
          <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
        </Menu>
      </Stack>
    </Stack>
  );
};

export default Navigation;
