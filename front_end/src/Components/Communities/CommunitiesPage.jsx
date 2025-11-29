import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, Box, Button, Card, CardContent, Stack, Typography, Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { followUserAction } from "../../Store/Auth/Action";
import UserSearchList from "../RightPart/UserSearchList";
import { api } from "../../config/api";

const CommunitiesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { auth } = useSelector((store) => store);
  const currentUser = auth.user;
  const followings = currentUser?.followings || [];

  const [featuredUsers, setFeaturedUsers] = useState([]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get("/api/users/featured");
        setFeaturedUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Không thể tải danh sách người dùng nổi bật", e);
        setFeaturedUsers([]);
      }
    };

    fetchFeatured();
  }, []);

  const handleToggleFollow = (userId) => {
    dispatch(followUserAction(userId));
  };

  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      {/* Đang theo dõi */}
      <Card
        sx={{
          borderRadius: 4,
          bgcolor: "#f8fafc",
          border: "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: "#0f172a", fontWeight: 700, mb: 2 }}>
            Đang theo dõi
          </Typography>
          {followings.length === 0 ? (
            <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.5)" }}>
              Bạn chưa theo dõi ai.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {followings.map((u) => (
                <Stack
                  key={u.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1.5}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ cursor: "pointer" }}
                    onClick={() => navigate(`/profile/${u.id}`)}
                  >
                    <Avatar
                      src={(() => {
                        const img = u.image;
                        if (!img) return undefined;
                        return img.startsWith("/") ? `http://localhost:5454${img}` : img;
                      })()}
                      alt={u.fullName || u.email || "U"}
                      sx={{ width: 32, height: 32 }}
                    >
                      {!u.image && (u.fullName || u.email)
                        ? (u.fullName || u.email).trim().charAt(0).toUpperCase()
                        : null}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                        {u.fullName}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "rgba(15,23,42,0.6)" }}>
                        @{(u.fullName || "unknown").split("").join("_").toLowerCase()}
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => handleToggleFollow(u.id)}
                    sx={{
                      textTransform: "none",
                      borderRadius: 999,
                      fontSize: 12,
                      px: 1.8,
                      py: 0.4,
                    }}
                  >
                    Bỏ theo dõi
                  </Button>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Tìm người để theo dõi */}
      <Card
        sx={{
          borderRadius: 4,
          bgcolor: "#f8fafc",
          border: "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: "#0f172a", fontWeight: 700, mb: 1.5 }}>
            Tìm người để theo dõi
          </Typography>
          <UserSearchList />
        </CardContent>
      </Card>

      {/* Người dùng nổi bật */}
      <Card
        sx={{
          borderRadius: 4,
          bgcolor: "#f8fafc",
          border: "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: "#0f172a", fontWeight: 700, mb: 2 }}>
            Người dùng nổi bật
          </Typography>
          {featuredUsers.length === 0 ? (
            <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.5)" }}>
              Chưa có người dùng nổi bật.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              {featuredUsers.map((u) => {
                const isSelf = currentUser && u.id === currentUser.id;
                const isFollowing = !!followings.find((f) => f.id === u.id);

                return (
                <Stack
                  key={u.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1.5}
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigate(`/profile/${u.id}`)}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar
                      src={(() => {
                        const img = u.image;
                        if (!img) return undefined;
                        return img.startsWith("/") ? `http://localhost:5454${img}` : img;
                      })()}
                      alt={u.fullName || u.email || "U"}
                      sx={{ width: 32, height: 32 }}
                    >
                      {!u.image && (u.fullName || u.email)
                        ? (u.fullName || u.email).trim().charAt(0).toUpperCase()
                        : null}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                        {u.fullName}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.3 }}>
                        <Chip
                          size="small"
                          label={`${u.followersCount} follower`}
                          sx={{ fontSize: 11, bgcolor: "#e0f2fe" }}
                        />
                        <Chip
                          size="small"
                          label={`${u.totalLikes} lượt thích`}
                          sx={{ fontSize: 11, bgcolor: "#fef3c7" }}
                        />
                      </Stack>
                    </Box>
                  </Stack>
                  {currentUser && !isSelf && (
                    <Button
                      size="small"
                      variant={isFollowing ? "outlined" : "contained"}
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatch(followUserAction(u.id));
                      }}
                      sx={{
                        textTransform: "none",
                        borderRadius: 999,
                        fontSize: 12,
                        px: 1.8,
                        py: 0.4,
                      }}
                    >
                      {isFollowing ? "Bỏ theo dõi" : "Theo dõi"}
                    </Button>
                  )}
                </Stack>
              )})}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default CommunitiesPage;
