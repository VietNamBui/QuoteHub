import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../../config/api";
import { followUserAction } from "../../Store/Auth/Action";
import { useNavigate } from "react-router-dom";

const UserSearchList = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { auth } = useSelector((store) => store);
  const currentUserId = auth.user?.id;

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value || value.trim().length < 1) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.get(`/api/users/search`, {
        params: { query: value.trim() },
      });
      console.log("search users data", JSON.stringify(data));
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : [];
      setResults(list);
    } catch (error) {
      console.error("Search users error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFollow = (userId) => {
    dispatch(followUserAction(userId));
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
  };

  return (
    <Box>
      <TextField
        fullWidth
        placeholder="Tìm kiếm người dùng để theo dõi..."
        variant="outlined"
        size="small"
        value={query}
        onChange={handleSearch}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: "rgba(15,23,42,0.45)" }} />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              {loading ? (
                <CircularProgress size={18} />
              ) : query ? (
                <IconButton size="small" onClick={handleClear}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              ) : null}
            </InputAdornment>
          ),
        }}
      />

      {results.length > 0 && (
        <Box mt={1.5} sx={{ maxHeight: 260, overflowY: "auto" }}>
          <List dense>
            {results.map((u) => (
              <ListItem
                key={u.id}
                secondaryAction={
                  u.id !== currentUserId && (
                    <Button
                      size="small"
                      variant={u.followed ? "outlined" : "contained"}
                      onClick={() => handleToggleFollow(u.id)}
                      sx={{
                        textTransform: "none",
                        borderRadius: 999,
                        fontSize: 12,
                        px: 1.8,
                        py: 0.3,
                      }}
                    >
                      {u.followed ? "Bỏ theo dõi" : "Theo dõi"}
                    </Button>
                  )
                }
              >
                <ListItemAvatar>
                  <Avatar
                    src={u.image || undefined}
                    alt={u.fullName || u.email || "U"}
                    sx={{ width: 32, height: 32, cursor: "pointer" }}
                    onClick={() => navigate(`/profile/${u.id}`)}
                  >
                    {(!u.image && (u.fullName || u.email))
                      ? (u.fullName || u.email).trim().charAt(0).toUpperCase()
                      : null}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography
                      sx={{ fontWeight: 600, fontSize: 14, cursor: "pointer" }}
                      onClick={() => navigate(`/profile/${u.id}`)}
                    >
                      {u.fullName}
                    </Typography>
                  }
                  secondary={
                    <Typography sx={{ fontSize: 12, color: "rgba(15,23,42,0.6)" }}>
                      @{(u.fullName || "unknown").split("").join("_").toLowerCase()}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {query && !loading && results.length === 0 && (
        <Typography
          variant="body2"
          sx={{ mt: 1, color: "rgba(15,23,42,0.5)", fontStyle: "italic" }}
        >
          Không tìm thấy người dùng nào phù hợp.
        </Typography>
      )}
    </Box>
  );
};

export default UserSearchList;
