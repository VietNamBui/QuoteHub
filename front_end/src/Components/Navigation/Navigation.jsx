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
            {/* Logo QuoteHub: icon cuốn sách */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
            >
              <path
                d="M5.5 5.25C5.5 4.56 6.06 4 6.75 4h7.5c.83 0 1.5.67 1.5 1.5v12.25c0 .28-.22.5-.5.5H6.75A1.25 1.25 0 0 1 5.5 17V5.25Z"
                fill="#ffffff"
                stroke="#0f172a"
                strokeWidth="1.4"
              />
              <path
                d="M10.25 4H17c.83 0 1.5.67 1.5 1.5v11.75c0 .55-.45 1-1 1-.2 0-.39-.06-.55-.17l-2.9-1.93a1.5 1.5 0 0 0-.83-.25H9.5"
                stroke="#0f172a"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 8h5"
                stroke="#0f172a"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path
                d="M8 10.5h3.5"
                stroke="#0f172a"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
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
          alt={auth.user?.fullName || auth.user?.email || "U"}
          src={(() => {
            const img = auth.user?.image;
            if (!img) return undefined;
            return img.startsWith("/")
              ? `http://localhost:5454${img}`
              : img;
          })()}
        >
          {(!auth.user?.image && (auth.user?.fullName || auth.user?.email))
            ? (auth.user.fullName || auth.user.email).trim().charAt(0).toUpperCase()
            : null}
        </Avatar>
        <Box flex={1}>
          <Typography sx={{ color: "#0f172a", fontWeight: 600 }}>
            {auth.user?.fullName || "Thành viên QuoteHub"}
          </Typography>
          <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.6)" }}>
            @{auth.user?.email || "unknown"}
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
