import React, { useEffect } from "react";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useNavigate, useParams } from "react-router-dom";
import TweetCard from "../HomeSection/TweetCard";
import { Box, Divider, IconButton, Stack, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { findTwitsById } from "../../Store/Twit/Action";

const TwitDetais = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { twit } = useSelector((store) => store);

  useEffect(() => {
    if (id) {
      dispatch(findTwitsById(id));
    }
  }, [dispatch, id]);

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        sx={{
          position: "sticky",
          top: -25,
          zIndex: 10,
          px: 1,
          py: 2,
          bgcolor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(15,23,42,0.05)",
        }}
      >
        <IconButton onClick={() => navigate(-1)} sx={{ color: "#0f172a" }}>
          <KeyboardBackspaceIcon />
        </IconButton>
        <div>
          <Typography variant="subtitle2" sx={{ color: "rgba(15,23,42,0.6)", textTransform: "uppercase" }}>
            Chi tiết trích dẫn
          </Typography>
          <Typography variant="h5" sx={{ color: "#0f172a", fontWeight: 700 }}>
            Tweet
          </Typography>
        </div>
      </Stack>

      <Box sx={{ py: 2 }}>
        <TweetCard item={twit.twit} />
        <Divider sx={{ my: 4, borderColor: "rgba(15,23,42,0.08)" }} />
      </Box>

      <Stack spacing={3}>
        {twit.twit?.replyTwits && twit.twit.replyTwits.length > 0 ? (
          twit.twit.replyTwits.map((item, index) => (
            <TweetCard key={item.id || index} item={item} />
          ))
        ) : (
          <Box
            sx={{
              textAlign: "center",
              py: 6,
              borderRadius: 4,
              border: "1px dashed rgba(255,255,255,0.2)",
            }}
          >
            <Typography sx={{ color: "rgba(15,23,42,0.6)" }}>
              Chưa có phản hồi nào. Hãy là người đầu tiên chia sẻ cảm nhận của bạn.
            </Typography>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default TwitDetais;
