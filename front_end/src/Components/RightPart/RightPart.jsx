import React, { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import SubscriptionModal from "../SubscriptionModal/SubscriptionModal";
import UserSearchList from "./UserSearchList";
import { useSelector, useDispatch } from "react-redux";
import { followUserAction } from "../../Store/Auth/Action";
import { useNavigate } from "react-router-dom";
import { api } from "../../config/api";

const RightPart = () => {
  const [openSubscriptionModel, setOpenSubscriptionModel] = useState(false);
  const [bookTrends, setBookTrends] = useState([]); // xu hướng sách toàn cộng đồng
  const [friendBookTrends, setFriendBookTrends] = useState([]); // xu hướng sách từ bạn bè

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { auth } = useSelector((store) => store);
  const currentUser = auth.user;
  const followings = currentUser?.followings || [];

  const handleOpenSubcriptionModel = () => setOpenSubscriptionModel(true);
  const handleCloseSubcriptionModel = () => setOpenSubscriptionModel(false);
  const handleChangeTheme = () => {
    console.log("handle change theme");
  };

  // Gọi API xu hướng khi có jwt (đăng nhập) và cập nhật theo danh sách followings
  useEffect(() => {
    const jwt = auth.jwt || localStorage.getItem("jwt");
    if (!jwt) return;

    // Sách được trích dẫn nhiều trong cộng đồng (không phụ thuộc follow)
    api
      .get("/api/twits/trending/books")
      .then((res) => {
        setBookTrends(res.data || []);
      })
      .catch(() => {
        setBookTrends([]);
      });

    // Nếu không còn theo dõi ai, xoá luôn xu hướng bạn bè
    if (!followings || followings.length === 0) {
      setFriendBookTrends([]);
      return;
    }

    // Sách bạn bè đang trích dẫn
    api
      .get("/api/twits/trending/friends")
      .then((res) => {
        setFriendBookTrends(res.data || []);
      })
      .catch(() => {
        setFriendBookTrends([]);
      });
  }, [auth.jwt, auth.user?.id, followings?.length]);

  const handleToggleFollow = (userId) => {
    dispatch(followUserAction(userId));
  };

  return (
    <Stack spacing={3}>
      <TextField
        fullWidth
        placeholder="Tìm kiếm tác giả, chủ đề…"
        variant="outlined"
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "rgba(15,23,42,0.45)" }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleChangeTheme} sx={{ color: "rgba(15,23,42,0.5)" }}>
                <Brightness4Icon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
          sx: {
            borderRadius: 999,
            bgcolor: "#f8fafc",
            color: "#0f172a",
          },
        }}
      />

      <Card
        sx={{
          borderRadius: 4,
          bgcolor: "#f8fafc",
          border: "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: "#0f172a", fontWeight: 700, mb: 2 }}>
            Sách được trích dẫn nhiều
          </Typography>
          {bookTrends.length === 0 ? (
            <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.6)" }}>
              Chưa có dữ liệu xu hướng.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {bookTrends.map((b) => (
                <Stack key={b.bookId} direction="row" alignItems="flex-start" spacing={1.5}>
                  <Box flex={1}>
                    <Typography variant="caption" sx={{ color: "rgba(15,23,42,0.5)" }}>
                      Sách
                    </Typography>
                    <Typography sx={{ color: "#0f172a", fontWeight: 600 }}>
                      {b.bookTitle}
                    </Typography>
                    {b.bookAuthor && (
                      <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.7)" }}>
                        {b.bookAuthor}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.6)" }}>
                      {b.quoteCount} trích dẫn từ cộng đồng
                    </Typography>
                  </Box>
                  <IconButton size="small" sx={{ color: "rgba(15,23,42,0.4)" }}>
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Xu hướng theo hoạt động bạn bè */}
      {currentUser && (
        <Card
          sx={{
            borderRadius: 4,
            bgcolor: "#f8fafc",
            border: "1px solid rgba(15,23,42,0.08)",
          }}
        >
          <CardContent>
            <Typography variant="h6" sx={{ color: "#0f172a", fontWeight: 700, mb: 2 }}>
              Bạn bè đang trích dẫn
            </Typography>
            {friendBookTrends.length === 0 ? (
              <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.6)" }}>
                Bạn bè chưa có hoạt động nổi bật.
              </Typography>
            ) : (
              <Stack spacing={2}>
                {friendBookTrends.map((b) => (
                  <Stack key={b.bookId} direction="row" alignItems="flex-start" spacing={1.5}>
                    <Box flex={1}>
                      <Typography variant="caption" sx={{ color: "rgba(15,23,42,0.5)" }}>
                        Sách từ bạn bè
                      </Typography>
                      <Typography sx={{ color: "#0f172a", fontWeight: 600 }}>
                        {b.bookTitle}
                      </Typography>
                      {b.bookAuthor && (
                        <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.7)" }}>
                          {b.bookAuthor}
                        </Typography>
                      )}
                      <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.6)" }}>
                        {b.friendCount} người bạn · {b.twitCount} trích dẫn
                      </Typography>
                    </Box>
                    <IconButton size="small" sx={{ color: "rgba(15,23,42,0.4)" }}>
                      <MoreHorizIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      )}

      <SubscriptionModal open={openSubscriptionModel} handleClose={handleCloseSubcriptionModel} />
    </Stack>
  );
};

export default RightPart;
