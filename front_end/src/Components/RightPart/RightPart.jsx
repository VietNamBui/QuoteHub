import React from "react";
import {
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

const trendingTopics = [
  {
    label: "Sách nói",
    title: "#MindfulMorning",
    tweets: "12.4K trích dẫn",
  },
  {
    label: "Ebook",
    title: "Tư duy ngược dòng",
    tweets: "9.1K lượt lưu",
  },
  {
    label: "Cộng đồng",
    title: "#QuoteHubSpaces",
    tweets: "4.3K cuộc trò chuyện",
  },
];

const RightPart = () => {
  const [openSubscriptionModel, setOpenSubscriptionModel] = React.useState(false);
  const handleOpenSubcriptionModel = () => setOpenSubscriptionModel(true);
  const handleCloseSubcriptionModel = () => setOpenSubscriptionModel(false);
  const handleChangeTheme = () => {
    console.log("handle change theme");
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
          background: "linear-gradient(135deg, #eef2ff, #dbeafe)",
          color: "#0f172a",
          border: "1px solid rgba(37,99,235,0.2)",
        }}
      >
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(37,99,235,0.12)",
              }}
            >
              <VerifiedRoundedIcon fontSize="large" />
            </Box>
            <Box>
              <Typography fontWeight={700}>Nâng cấp tài khoản</Typography>
              <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.6)" }}>
                Mở khóa huy hiệu xác thực và thư viện cảm hứng nâng cao.
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "0 12px 24px rgba(59,130,246,0.3)",
            }}
            onClick={handleOpenSubcriptionModel}
          >
            Đăng ký QuoteHub+
          </Button>
        </CardContent>
      </Card>

      <Card
        sx={{
          borderRadius: 4,
          bgcolor: "#f8fafc",
          border: "1px solid rgba(15,23,42,0.08)",
        }}
      >
        <CardContent>
          <Typography variant="h6" sx={{ color: "#0f172a", fontWeight: 700, mb: 2 }}>
            Xu hướng hôm nay
          </Typography>
          <Stack spacing={2}>
            {trendingTopics.map((topic) => (
              <React.Fragment key={topic.title}>
                <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                  <Box flex={1}>
                    <Typography variant="caption" sx={{ color: "rgba(15,23,42,0.5)" }}>
                      {topic.label}
                    </Typography>
                    <Typography sx={{ color: "#0f172a", fontWeight: 600 }}>
                      {topic.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.6)" }}>
                      {topic.tweets}
                    </Typography>
                  </Box>
                  <IconButton size="small" sx={{ color: "rgba(15,23,42,0.4)" }}>
                    <MoreHorizIcon fontSize="small" />
                  </IconButton>
                </Stack>
                {topic.title !== trendingTopics[trendingTopics.length - 1].title && (
                  <Divider sx={{ borderColor: "rgba(15,23,42,0.08)" }} />
                )}
              </React.Fragment>
            ))}
          </Stack>
        </CardContent>
      </Card>

      <SubscriptionModal open={openSubscriptionModel} handleClose={handleCloseSubcriptionModel} />
    </Stack>
  );
};

export default RightPart;
