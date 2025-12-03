import React, { useEffect, useState } from "react";
import RepeatIcon from "@mui/icons-material/Repeat";
import { Avatar, Button, Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem as MuiMenuItem } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import BarChartIcon from "@mui/icons-material/BarChart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteOutlined from "@mui/icons-material/Favorite";
import ReplyModal from "./ReplyModal";
import { useDispatch, useSelector } from "react-redux";
import { createReTweet, likeTweet, deleteTweet, updateTweet, reportTweet } from "../../Store/Twit/Action";
import { followUserAction } from "../../Store/Auth/Action";

const TweetCard = ({ item, onOpenDetail }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const [openReplyModal, setOpenReplyModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editContent, setEditContent] = useState(item?.content || "");
  const [books, setBooks] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const handleOpenReplyModel = () => setOpenReplyModal(true);
  const handleCloseReplyModal = () => setOpenReplyModal(false);
  const dispatch = useDispatch();
  const { auth } = useSelector((store) => store);
  const location = useLocation();
  const currentUserId = auth.user?.id;
  const isAdminInAdminView = auth.user?.admin && location.pathname.startsWith("/admin");

  // Tính trạng thái đã theo dõi author dựa trên danh sách followings hiện tại
  const isAuthorFollowed =
    (auth.user?.followings || []).some((u) => u.id === item?.user?.id) ||
    Boolean(item?.user?.followed);

  const moderationStatus = item?.moderationStatus;
  const moderationLabel = (() => {
    if (!moderationStatus) return null;
    if (moderationStatus === "PENDING") return "Đang chờ duyệt";
    if (moderationStatus === "REJECTED") return "Đã bị từ chối";
    if (moderationStatus === "BLOCKED") return "Đã bị chặn";
    return null;
  })();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleOpenEdit = () => {
    setEditContent(item?.content || "");
    // Tự động chọn lại sách & quote hiện tại nếu backend trả về id
    setSelectedBookId(item?.quoteBookId || "");
    setSelectedQuoteId(item?.quoteId || null);
    setOpenEditModal(true);
    setAnchorEl(null);
  };
  const handleCloseEdit = () => setOpenEditModal(false);
  const handleDeleteTweet = () => {
    if (!item?.id) return;
    dispatch(deleteTweet(item.id));
    setAnchorEl(null);
  };

  const handleSaveEdit = () => {
    if (!item?.id) return;
    const trimmed = (editContent || "").trim();
    if (trimmed.length === 0) {
      handleCloseEdit();
      return;
    }
    dispatch(updateTweet(item.id, trimmed, selectedQuoteId));
    setOpenEditModal(false);
  };

  // Khi mở modal edit lần đầu, load danh sách sách & quote
  useEffect(() => {
    if (!openEditModal) return;

    const fetchBooks = async () => {
      try {
        const res = await fetch("http://localhost:5454/api/quotes/books/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwt")}`,
          },
        });
        const data = await res.json();
        setBooks(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Không thể tải danh sách sách", e);
      }
    };

    fetchBooks();
  }, [openEditModal]);

  // Khi chọn sách trong modal edit, load lại quotes
  useEffect(() => {
    if (!openEditModal) return;
    if (!selectedBookId) {
      setQuotes([]);
      return;
    }

    const fetchQuotesOfBook = async () => {
      try {
        const res = await fetch(
          `http://localhost:5454/api/quotes/book/${selectedBookId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("jwt")}`,
            },
          }
        );
        const data = await res.json();
        setQuotes(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Không thể tải danh sách quote của sách", e);
      }
    };

    fetchQuotesOfBook();
  }, [selectedBookId, openEditModal]);

  const handleCreateRetweet = () => {
    dispatch(createReTweet(item?.id));
    console.log("handle create retweet");
  };
  const handleLiketweet = () => {
    dispatch(likeTweet(item?.id));
    console.log("handle like tweet");
  };

  const handleToggleFollowAuthor = () => {
    if (!item?.user?.id || item.user.id === currentUserId) return;
    dispatch(followUserAction(item.user.id));
  };

  const handleReportTweet = () => {
    if (!item?.id) return;
    const defaultReason = "Nội dung không phù hợp";
    const reason = window.prompt("Lý do báo cáo bài viết này?", defaultReason);
    if (!reason) return;
    dispatch(reportTweet(item.id, reason));
  };
  return (
    <React.Fragment>
      <div className="flex space-x-4 rounded-3xl bg-white/80 shadow-sm border border-slate-100 px-5 py-4 transition hover:shadow-md">
        <Avatar
          onClick={() => navigate(`/profile/${item?.user.id}`)}
          className="cursor-pointer"
          alt={item?.user?.fullName || item?.user?.email || "U"}
          src={(() => {
            if (item?.user?.id && item.user.id === auth.user?.id && auth.user?.image) {
              const img = auth.user.image;
              return img.startsWith("/") ? `http://localhost:5454${img}` : img;
            }
            const img = item?.user?.image;
            if (!img) return undefined;
            if (img.startsWith("/")) {
              return `http://localhost:5454${img}`;
            }
            return img;
          })()}
        >
          {!item?.user?.image && (item?.user?.fullName || item?.user?.email)
            ? (item.user.fullName || item.user.email).trim().charAt(0).toUpperCase()
            : null}
        </Avatar>
        <div
          className={
            isAdminInAdminView
              ? "w-full"
              : "w-full cursor-pointer"
          }
          onClick={
            isAdminInAdminView
              ? undefined
              : onOpenDetail || handleOpenReplyModel
          }
        >
          <div className="flex justify-between items-center">
            <div className="flex cursor-pointer items-center space-x-2">
              <span className="font-semibold">{item?.user?.fullName || "Ẩn danh"}</span>
              <span className="text-gray-600">
                @{item?.user?.email || "unknown"} . 2m
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {moderationLabel && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {moderationLabel}
                </span>
              )}
              {!isAdminInAdminView && item?.user?.id !== currentUserId && (
                <Button
                  size="small"
                  variant={isAuthorFollowed ? "outlined" : "contained"}
                  onClick={handleToggleFollowAuthor}
                  sx={{
                    textTransform: "none",
                    borderRadius: "999px",
                    fontSize: 12,
                    px: 1.8,
                    py: 0.3,
                  }}
                >
                  {isAuthorFollowed ? "Bỏ theo dõi" : "Theo dõi"}
                </Button>
              )}

              {/* Nút Report: chỉ hiện khi đã đăng nhập VÀ không phải bài của chính mình (không dùng trong admin view) */}
              {auth.user && !isAdminInAdminView && item?.user?.id !== currentUserId && (
                <Button
                  size="small"
                  variant="text"
                  onClick={handleReportTweet}
                  sx={{ textTransform: "none", fontSize: 11 }}
                >
                  Báo cáo
                </Button>
              )}

              {/* Chỉ chủ bài viết mới thấy menu Edit/Delete */}
              {item?.user?.id === currentUserId && (
                <>
                  <Button
                    id="basic-button"
                    aria-controls={open ? "basic-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={handleClick}
                  >
                    <MoreHorizIcon />
                  </Button>
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
                    <MenuItem onClick={handleDeleteTweet}>Delete</MenuItem>
                    <MenuItem onClick={handleOpenEdit}>Edit</MenuItem>
                  </Menu>
                </>
              )}
            </div>
          </div>
          <div className="mt-2">
            <div
              className={
                isAdminInAdminView
                  ? "space-y-2"
                  : "cursor-pointer space-y-2"
              }
            >
              {item?.quoteHighlight && (
                <div className="border-l-4 border-blue-500 pl-3 text-gray-800 italic bg-slate-50 rounded-2xl py-2 pr-3">
                  <p className="mb-1">“{item.quoteHighlight}”</p>
                  {(item?.quoteBookTitle || item?.quoteBookAuthor) && (
                    <p className="text-xs text-gray-500">
                      {item?.quoteBookTitle}
                      {item?.quoteBookAuthor ? ` · ${item.quoteBookAuthor}` : ""}
                    </p>
                  )}
                </div>
              )}

              {item?.content && <p className="mb-2 p-0 text-[15px] leading-relaxed">{item.content}</p>}

              {item?.image && (
                <img
                  className="mt-2 max-h-80 w-full rounded-2xl border border-slate-200 object-cover"
                  src={item.image}
                  alt="tweet"
                />
              )}
            </div>
            <div className="py-3 flex flex-wrap justify-between items-center text-slate-600 text-sm">
              <div className="space-x-3 flex items-center text-gray-600">
                <ChatBubbleOutlineIcon
                  className="cursor-pointer"
                  onClick={onOpenDetail ? onOpenDetail : handleOpenReplyModel}
                />
                <p>{item?.totalReplies}</p>
              </div>
              <div
                className={`${
                  item?.retwit ? "text-pink-600" : "text-gray-600"
                } space-x-3 items-center`}
              >
                <RepeatIcon
                  onClick={handleCreateRetweet}
                  className="cursor-pointer"
                />
                <p>{item?.totalRetweets}</p>
              </div>
              <div
                className={`${
                  item?.liked ? "text-pink-600" : "text-gray-600"
                } space-x-3 items-center`}
              >
                {item?.liked ? (
                  <FavoriteOutlined
                    onClick={handleLiketweet}
                    className="cursor-pointer"
                  />
                ) : (
                  <FavoriteIcon
                    onClick={handleLiketweet}
                    className="cursor-pointer"
                  />
                )}
                <p>{item?.totalLikes}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <section>
        <ReplyModal item={item} open={openReplyModal} handleClose={handleCloseReplyModal} />
      </section>

      {/* Edit twit modal */}
      <Dialog open={openEditModal} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle>Sửa nội dung trích dẫn</DialogTitle>
        <DialogContent>
          {/* Chọn lại sách */}
          <TextField
            select
            fullWidth
            margin="dense"
            label="Chọn sách"
            size="small"
            value={selectedBookId}
            onChange={(e) => {
              const bookId = e.target.value;
              setSelectedBookId(bookId);
              setSelectedQuoteId(null);
            }}
          >
            {books.map((b) => (
              <MuiMenuItem key={b.bookId || b.id} value={b.bookId || b.id}>
                {b.title} {b.author ? `· ${b.author}` : ""}
              </MuiMenuItem>
            ))}
          </TextField>

          {/* Chọn lại quote trong sách */}
          <TextField
            select
            fullWidth
            margin="dense"
            label={selectedBookId ? "Chọn một câu quote" : "Hãy chọn sách trước"}
            size="small"
            value={selectedQuoteId || ""}
            onChange={(e) => setSelectedQuoteId(e.target.value)}
            disabled={!selectedBookId}
          >
            {quotes.map((q) => (
              <MuiMenuItem key={q.id} value={q.id} sx={{ whiteSpace: "normal", lineHeight: 1.3 }}>
                {q.highlight?.length > 120
                  ? q.highlight.slice(0, 120) + "..."
                  : q.highlight}
              </MuiMenuItem>
            ))}
          </TextField>

          <TextField
            multiline
            minRows={3}
            fullWidth
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Hủy</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Lưu</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export default TweetCard;
