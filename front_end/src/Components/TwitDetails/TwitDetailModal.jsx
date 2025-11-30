import React, { useState, useEffect, useRef } from "react";
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Modal,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RepeatIcon from "@mui/icons-material/Repeat";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteOutlined from "@mui/icons-material/FavoriteOutlined";
import { useNavigate } from "react-router-dom";
import ReplyModal from "../HomeSection/ReplyModal";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { useDispatch } from "react-redux";
import { findTwitsById, createReTweet, likeTweet } from "../../Store/Twit/Action";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 980,
  maxWidth: "96vw",
  maxHeight: "88vh",
  bgcolor: "rgba(255,255,255,0.98)",
  borderRadius: 8,
  boxShadow: "0 18px 45px rgba(15,23,42,0.25)",
  border: "1px solid rgba(148,163,184,0.35)",
  overflow: "hidden",
};

const TwitDetailModal = ({ open, onClose, twit, rootId }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [openReplyModal, setOpenReplyModal] = useState(false);
  const [replyTarget, setReplyTarget] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState({});
  const commentsRef = useRef(null);

  const handleBackToRoot = () => {
    if (!rootId || !twit || twit.id === rootId) return;
    dispatch(findTwitsById(rootId));
  };

  const handleLikeInModal = () => {
    if (!twit) return;
    dispatch(likeTweet(twit.id));
    dispatch(findTwitsById(twit.id));
  };

  const handleRetweetInModal = () => {
    if (!twit) return;
    dispatch(createReTweet(twit.id));
    dispatch(findTwitsById(twit.id));
  };

  const handleOpenReplyFor = (target) => {
    setReplyTarget(target || twit);
    setOpenReplyModal(true);
  };

  const handleCloseReplyModal = () => {
    setOpenReplyModal(false);
  };

  const replies = twit?.replyTwits || [];

  useEffect(() => {
    if (commentsRef.current) {
      commentsRef.current.scrollTop = commentsRef.current.scrollHeight;
    }
  }, [twit?.totalReplies]);

  if (!twit) return null;

  const ReplyThread = ({ node, depth = 0 }) => {
    const isExpanded = expandedReplies[node.id];
    const maxLength = 200;
    const isLong = (node.content || "").length > maxLength;
    const displayContent = !isLong || isExpanded
      ? node.content
      : `${node.content.slice(0, maxLength)}...`;
    const indent = depth > 0 ? 2 : 0;

    return (
      <Box sx={{ display: "flex", mb: 2.5, pl: indent }}>
        <Avatar
          alt={node.user?.fullName || node.user?.email || "U"}
          src={node.user?.avatar || undefined}
          sx={{ mr: 1.5, cursor: "pointer", width: depth > 0 ? 32 : 40, height: depth > 0 ? 32 : 40 }}
          onClick={() => navigate(`/profile/${node.user?.id}`)}
        >
          {!node.user?.avatar && (node.user?.fullName || node.user?.email)
            ? (node.user.fullName || node.user.email).trim().charAt(0).toUpperCase()
            : null}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>
                {node.user?.fullName || node.user?.email}
              </Typography>
              <Typography sx={{ fontSize: 12, color: "#94a3b8" }}>
                @{node.user?.email || node.user?.username || "unknown"} · 2m
              </Typography>
            </Box>
            <Button
              size="small"
              sx={{ textTransform: "none", fontSize: 12, color: "#2563eb" }}
              onClick={() => handleOpenReplyFor(node)}
            >
              Trả lời
            </Button>
          </Box>
          <Typography sx={{ mt: 1, fontSize: 14, color: "#0f172a" }}>
            {displayContent}
          </Typography>
          {isLong && (
            <Button
              size="small"
              sx={{
                mt: 0.5,
                textTransform: "none",
                fontSize: 12,
                padding: 0,
                minWidth: "auto",
                color: "#64748b",
              }}
              onClick={() =>
                setExpandedReplies((prev) => ({
                  ...prev,
                  [node.id]: !isExpanded,
                }))
              }
            >
              {isExpanded ? "Thu gọn" : "Xem thêm"}
            </Button>
          )}
          {node.replyTwits && node.replyTwits.length > 0 && (
            <Box sx={{ mt: 1.5, ml: 2, borderLeft: "1px solid rgba(226,232,240,1)", pl: 2 }}>
              {node.replyTwits.map((child) => (
                <ReplyThread key={child.id} node={child} depth={depth + 1} />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        sx={{
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(15,23,42,0.55)",
            backdropFilter: "blur(2px)",
          },
        }}
      >
        <Box sx={modalStyle}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              bgcolor: "#f8fafc",
            }}
          >
            {/* NỘI DUNG TWIT - Ở TRÊN */}
            <Box
              sx={{
                flex: 0,
                display: "flex",
                flexDirection: "column",
                borderBottom: "1px solid rgba(226,232,240,1)",
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderBottom: "1px solid rgba(226,232,240,1)",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  {rootId && twit.id !== rootId && (
                    <IconButton
                      size="small"
                      onClick={handleBackToRoot}
                      sx={{ mr: 1, color: "#64748b" }}
                    >
                      <KeyboardBackspaceIcon fontSize="small" />
                    </IconButton>
                  )}
                  <Avatar
                    alt={twit.user?.fullName || twit.user?.email || "U"}
                    src={twit.user?.image || undefined}
                    onClick={() => navigate(`/profile/${twit.user?.id}`)}
                    sx={{ cursor: "pointer" }}
                  >
                    {!twit.user?.image && (twit.user?.fullName || twit.user?.email)
                      ? (twit.user.fullName || twit.user.email).trim().charAt(0).toUpperCase()
                      : null}
                  </Avatar>
                  <div>
                    <Typography sx={{ fontWeight: 600, color: "#0f172a" }}>
                      {twit.user?.fullName || "Ẩn danh"}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "#64748b" }}>
                      @{twit.user?.email || "unknown"} · 2m
                    </Typography>
                  </div>
                </Stack>

                <IconButton onClick={onClose} sx={{ color: "#64748b" }}>
                  <CloseIcon />
                </IconButton>
              </Box>

              <Box
                sx={{
                  px: 3,
                  pt: 2,
                  pb: 2,
                  overflowY: "auto",
                }}
              >
                {twit.quoteHighlight && (
                  <Box
                    sx={{
                      borderLeft: "4px solid #1d9bf0",
                      pl: 2,
                      pr: 1.5,
                      py: 1.5,
                      mb: 2,
                      borderRadius: 3,
                      bgcolor: "white",
                    }}
                  >
                    <Typography sx={{ fontStyle: "italic", color: "#0f172a" }}>
                      “{twit.quoteHighlight}”
                    </Typography>
                    {(twit.quoteBookTitle || twit.quoteBookAuthor) && (
                      <Typography sx={{ fontSize: 12, color: "#64748b", mt: 0.5 }}>
                        {twit.quoteBookTitle}
                        {twit.quoteBookAuthor ? ` · ${twit.quoteBookAuthor}` : ""}
                      </Typography>
                    )}
                  </Box>
                )}

                {twit.content && (
                  <Typography sx={{ mb: 1.5, fontSize: 15, color: "#0f172a" }}>
                    {twit.content}
                  </Typography>
                )}

                {twit.image && (
                  <Box sx={{ mt: 1.5, mb: 2 }}>
                    <img
                      src={twit.image}
                      alt="tweet"
                      style={{
                        maxHeight: 380,
                        width: "100%",
                        borderRadius: 6,
                        objectFit: "cover",
                        border: "1px solid rgba(226,232,240,1)",
                      }}
                    />
                  </Box>
                )}

                <Stack
                  direction="row"
                  spacing={3}
                  alignItems="center"
                  sx={{
                    py: 1.5,
                    color: "#64748b",
                    fontSize: 13,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <ChatBubbleOutlineIcon fontSize="small" />
                    <span>{twit.totalReplies || 0}</span>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <RepeatIcon
                      fontSize="small"
                      onClick={handleRetweetInModal}
                      sx={{ cursor: "pointer" }}
                    />
                    <span>{twit.totalRetweets || 0}</span>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {twit.liked ? (
                      <FavoriteOutlined
                        fontSize="small"
                        sx={{ color: "#db2777", cursor: "pointer" }}
                        onClick={handleLikeInModal}
                      />
                    ) : (
                      <FavoriteIcon
                        fontSize="small"
                        sx={{ cursor: "pointer" }}
                        onClick={handleLikeInModal}
                      />
                    )}
                    <span>{twit.totalLikes || 0}</span>
                  </Stack>
                </Stack>

                <Divider sx={{ my: 1 }} />
              </Box>
            </Box>

            {/* BÌNH LUẬN - Ở DƯỚI */}
            <Box
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                bgcolor: "white",
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  borderBottom: "1px solid rgba(226,232,240,1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography sx={{ fontWeight: 600, color: "#0f172a" }}>
                  Bình luận
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleOpenReplyFor(twit)}
                  sx={{
                    borderRadius: 999,
                    textTransform: "none",
                    fontSize: 13,
                    px: 2.5,
                    py: 0.5,
                    bgcolor: "#1e88e5",
                  }}
                >
                  Viết bình luận
                </Button>
              </Box>

              <Box
                ref={commentsRef}
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  px: 3,
                  py: 2,
                  pr: 2,
                  maxHeight: "40vh",
                }}
              >
                {replies.length === 0 && (
                  <Typography sx={{ fontSize: 14, color: "#94a3b8", textAlign: "center", py: 3 }}>
                    Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nhận của bạn.
                  </Typography>
                )}

                {replies.map((reply) => (
                  <ReplyThread key={reply.id} node={reply} />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Modal>

      <ReplyModal
        item={replyTarget || twit}
        open={openReplyModal}
        handleClose={handleCloseReplyModal}
      />
    </>
  );
};

export default TwitDetailModal;
