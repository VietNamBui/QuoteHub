import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, List, ListItem, ListItemAvatar, Avatar, ListItemText, Typography, Paper, Button } from "@mui/material";
import { fetchNotifications, markNotificationRead } from "../../Store/Notification/Action";

const NotificationPage = () => {
  const dispatch = useDispatch();
  const { notification, auth } = useSelector((store) => store);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    dispatch(fetchNotifications()).finally(() => setLoading(false));
  }, [dispatch]);

  const items = Array.isArray(notification?.items) ? notification.items : [];
  const unread = items.filter((n) => !n.readFlag);
  const read = items.filter((n) => n.readFlag);

  const renderText = (n) => {
    const senderName = n.senderName || "Người dùng";
    switch (n.type) {
      case "LIKE":
        return `${senderName} đã thích twit của bạn`;
      case "REPLY":
        return `${senderName} đã bình luận vào twit của bạn`;
      case "FOLLOW":
        return `${senderName} đã theo dõi bạn`;
      case "NEW_TWIT":
        return `${senderName} vừa đăng một bài viết mới`;
      default:
        return "Hoạt động mới";
    }
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Thông báo
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : items.length === 0 ? (
        <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.6)" }}>
          Chưa có thông báo nào.
        </Typography>
      ) : (
        <Box sx={{ display: "grid", gap: 2 }}>
          {/* Chưa đọc */}
          <Paper variant="outlined" sx={{ borderRadius: 3, p: 1.5 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Thông báo mới
            </Typography>
            {unread.length === 0 ? (
              <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.6)" }}>
                Không có thông báo mới.
              </Typography>
            ) : (
              <List>
                {unread.map((n) => (
                  <ListItem
                    key={n.id}
                    alignItems="flex-start"
                    button
                    onClick={() => {
                      if (n.twitId) {
                        navigate(`/twit/${n.twitId}`);
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={
                          n.senderImage
                            ? n.senderImage.startsWith("/")
                              ? `http://localhost:5454${n.senderImage}`
                              : n.senderImage
                            : undefined
                        }
                        alt={n.senderName}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={renderText(n)}
                      secondary={
                        n.twitContent
                          ? n.twitContent.length > 120
                            ? n.twitContent.slice(0, 120) + "..."
                            : n.twitContent
                          : undefined
                      }
                    />
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(markNotificationRead(n.id));
                      }}
                    >
                      Đã đọc
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>

          {/* Đã đọc */}
          <Paper variant="outlined" sx={{ borderRadius: 3, p: 1.5 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
              Đã đọc
            </Typography>
            {read.length === 0 ? (
              <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.6)" }}>
                Chưa có thông báo đã đọc.
              </Typography>
            ) : (
              <List>
                {read.map((n) => (
                  <ListItem
                    key={n.id}
                    alignItems="flex-start"
                    button
                    onClick={() => {
                      if (n.twitId) {
                        navigate(`/twit/${n.twitId}`);
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={
                          n.senderImage
                            ? n.senderImage.startsWith("/")
                              ? `http://localhost:5454${n.senderImage}`
                              : n.senderImage
                            : undefined
                        }
                        alt={n.senderName}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={renderText(n)}
                      secondary={
                        n.twitContent
                          ? n.twitContent.length > 120
                            ? n.twitContent.slice(0, 120) + "..."
                            : n.twitContent
                          : undefined
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default NotificationPage;
