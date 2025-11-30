import { Avatar, Button, MenuItem, TextField, Modal, Box, CircularProgress, Typography } from "@mui/material";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import ImageIcon from "@mui/icons-material/Image";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import TagFacesIcon from "@mui/icons-material/TagFaces";
import TweetCard from "./TweetCard";
import { useDispatch, useSelector } from "react-redux";
import { createTweet, getFeedTweets, findTwitsById } from './../../Store/Twit/Action';
import { store } from './../../Store/store';
import { uploadToCloudnary } from "../../Utils/uploadToCloudnary";
import TwitDetailModal from "../TwitDetails/TwitDetailModal";

const validationSchema = Yup.object().shape({
  content: Yup.string().required("Tweet text is required"),
});
const HomeSection = () => {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectImage, setSelectedImage] = useState("");
  const [books, setBooks] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState("");
  const [openTwitDetail, setOpenTwitDetail] = useState(false);
  const [currentRootTwitId, setCurrentRootTwitId] = useState(null);
  const [aiChecking, setAiChecking] = useState(false);
  const [aiResult, setAiResult] = useState(null); // { status, message }
  const dispatch = useDispatch();
  const { twit, auth } = useSelector((store) => store);
  // console.log("twit",twit)

  const handleSubmit = async (values,actions) => {
    if (!values.quoteId) {
      alert("Bạn phải chọn một câu quote trước khi đăng twit.");
      return;
    }
    if (!values.content.trim()) {
      alert("Tweet text is required");
      return;
    }

    const payload = {
      content: values.content,
      image: values.image,
      isTweet: true,
      quote: { id: values.quoteId }
    };

    setAiChecking(true);
    setAiResult(null);
    try {
      const data = await dispatch(createTweet(payload));
      const status = data?.moderationStatus;
      const reason = data?.moderationReason;

      if (status === "PENDING") {
        setAiResult({
          status: "pending",
          message:
            reason || "AI nghi ngờ một số điểm. Bài đang chờ duyệt thêm.",
        });
      } else {
        setAiResult({
          status: "ok",
          message:
            reason || "AI không phát hiện vi phạm. Bài đã được đăng.",
        });
      }
      actions.resetForm();
      setSelectedImage("");
    } catch (e) {
      setAiResult({ status: "error", message: e.message || "Đăng bài thất bại" });
    } finally {
      // Đợi một chút cho user kịp đọc kết quả rồi đóng popup
      setTimeout(() => {
        setAiChecking(false);
        setAiResult(null);
      }, 2000);
    }
  };

  useEffect(()=>{
    dispatch(getFeedTweets())
  },[twit.like,twit.retwit])

  // Lấy danh sách sách của user
  useEffect(() => {
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
  }, []);

  // Khi chọn sách thì load các quote thuộc sách đó
  useEffect(() => {
    const fetchQuotesOfBook = async () => {
      if (!selectedBookId) {
        setQuotes([]);
        return;
      }
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
  }, [selectedBookId]);

  const formik = useFormik({
    initialValues: {
      content: "",
      image: "",
      isTweet:true,
      quoteId: ""
    },
    onSubmit: handleSubmit,
    validationSchema,
    validateOnBlur: false,
    validateOnChange: false,
  });
  const handleSelectImage = async (event) => {
    setUploadingImage(true);
    const imgUrl = await uploadToCloudnary(event.target.files[0])
    formik.setFieldValue("image", imgUrl);
    setSelectedImage(imgUrl);
    setUploadingImage(false);
  };
  return (
    <div className="space-y-6">
      <section>
        <h1 className="pb-4 text-2xl font-semibold opacity-90">Home</h1>
      </section>
      <section className="pb-6">
        <div className="flex space-x-4 rounded-3xl bg-white/80 shadow-md border border-slate-100 px-5 py-4">
          <Avatar
            alt={auth.user?.fullName || auth.user?.email || "U"}
            src={(() => {
              const img = auth.user?.image;
              if (!img) return undefined;
              return img.startsWith("/") ? `http://localhost:5454${img}` : img;
            })()}
          >
            {!auth.user?.image && (auth.user?.fullName || auth.user?.email)
              ? (auth.user.fullName || auth.user.email).trim().charAt(0).toUpperCase()
              : null}
          </Avatar>
          <div className="w-full">
            <form 
                onSubmit={(e) => {
                e.preventDefault();          // quan trọng để tránh reload page
                handleSubmit(formik.values, formik);
              }}
            >
              <div className="space-y-4">
                {/* Chọn sách */}
                <TextField
                  select
                  fullWidth
                  variant="outlined"
                  size="small"
                  label="Chọn một cuốn sách"
                  value={selectedBookId}
                  onChange={(e) => {
                    const bookId = e.target.value;
                    setSelectedBookId(bookId);
                    formik.setFieldValue("quoteId", "");
                  }}
                  InputLabelProps={{ sx: { fontSize: 13 } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 999,
                      bgcolor: "rgba(248,250,252,0.9)",
                      "& fieldset": {
                        borderColor: "rgba(148,163,184,0.4)",
                      },
                      "&:hover fieldset": {
                        borderColor: "#1d9bf0",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#1d9bf0",
                      },
                    },
                  }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          maxHeight: 360,
                          borderRadius: 3,
                        },
                      },
                    },
                  }}
                >
                  {books.map((b) => (
                    <MenuItem key={b.bookId || b.id} value={b.bookId || b.id}>
                      {b.title} {b.author ? `· ${b.author}` : ""}
                    </MenuItem>
                  ))}
                </TextField>

                {/* Chọn quote trong sách đã chọn */}
                <TextField
                  select
                  fullWidth
                  variant="outlined"
                  size="small"
                  label={selectedBookId ? "Chọn một câu quote trong sách" : "Hãy chọn sách trước"}
                  value={formik.values.quoteId}
                  onChange={(e) => formik.setFieldValue("quoteId", e.target.value)}
                  InputLabelProps={{ sx: { fontSize: 13 } }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 999,
                      bgcolor: selectedBookId
                        ? "rgba(248,250,252,0.9)"
                        : "rgba(241,245,249,0.8)",
                      "& fieldset": {
                        borderColor: "rgba(148,163,184,0.4)",
                      },
                      "&:hover fieldset": {
                        borderColor: selectedBookId ? "#1d9bf0" : "rgba(148,163,184,0.4)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#1d9bf0",
                      },
                    },
                  }}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          maxHeight: 360,
                          borderRadius: 3,
                        },
                      },
                    },
                  }}
                  disabled={!selectedBookId}
                >
                  {quotes.map((q) => (
                    <MenuItem key={q.id} value={q.id} sx={{ whiteSpace: "normal", lineHeight: 1.3 }}>
                      {q.highlight?.length > 120
                        ? q.highlight.slice(0, 120) + "..."
                        : q.highlight}
                    </MenuItem>
                  ))}
                </TextField>
                <input
                  type="text"
                  name="content"
                  placeholder="Chuyện gì đang xảy ra vậy?"
                  className="border-none outline-none text-lg md:text-xl bg-transparent"
                  {...formik.getFieldProps("content")}
                />
                {/* {formik.errors.content && formik.touched.content && (
                  <span className="text-red-500">{formik.errors.content}</span>
                )} */}
              </div>
              {/*<div>
                            <img src="" alt="" />
                        </div> */}
              <div className="flex justify-between items-center mt-5">
                <div className="flex space-x-4 items-center text-slate-600">
                  <label className="flex items-center space-x-2 rounded-md cursor-pointer">
                    <ImageIcon className="text-[#1d9bf0]" />
                    <input
                      type="file"
                      name="imageFile"
                      className="hidden"
                      onChange={handleSelectImage}
                    />
                  </label>
                  <FmdGoodIcon className="text-[#1d9bf0]" />
                  <TagFacesIcon className="text-[#1d9bf0]" />
                </div>
                <div>
                  <Button
                    sx={{
                      borderRadius: "999px",
                      px: 3,
                      py: 1,
                      textTransform: "none",
                      fontWeight: 600,
                      bgcolor: "#1e88e5",
                    }}
                    variant="contained"
                    type="submit"
                  >
                    Tweet
                  </Button>
                </div>
              </div>
            </form>
            <div className="mt-3">
              {selectImage && (
                <img
                  src={selectImage}
                  alt="preview"
                  className="max-h-64 rounded-2xl border border-slate-200 object-cover"
                />
              )}
            </div>
          </div>
        </div>
      </section>
      <section className="space-y-4">
        {(twit.twits || [])
          .filter(
            (item) =>
              !item.moderationStatus || item.moderationStatus === "APPROVED"
          )
          .map((item) => (
            <TweetCard
              key={item.id}
              item={item}
              onOpenDetail={() => {
                setCurrentRootTwitId(item.id);
                dispatch(findTwitsById(item.id));
                setOpenTwitDetail(true);
              }}
            />
          ))}
      </section>
      <TwitDetailModal
        open={openTwitDetail}
        onClose={() => setOpenTwitDetail(false)}
        twit={twit.twit}
        rootId={currentRootTwitId}
      />

      {/* Popup trạng thái kiểm duyệt AI khi đăng tweet */}
      <Modal open={aiChecking} onClose={() => {}}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "white",
            boxShadow: 24,
            p: 4,
            borderRadius: 3,
            minWidth: 320,
            textAlign: "center",
          }}
        >
          {!aiResult && (
            <>
              <CircularProgress size={28} sx={{ mb: 2 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Đang chờ AI duyệt nội dung...
              </Typography>
            </>
          )}
          {aiResult && (
            <>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  mb: 1,
                  color:
                    aiResult.status === "ok"
                      ? "#16a34a"
                      : aiResult.status === "pending"
                      ? "#f59e0b"
                      : "#dc2626",
                }}
              >
                {aiResult.status === "ok"
                  ? "Kiểm duyệt thành công"
                  : aiResult.status === "pending"
                  ? "Bài đang chờ duyệt thêm"
                  : "Nội dung vi phạm"}
              </Typography>
              <Typography variant="body2" sx={{ color: "#4b5563" }}>
                {aiResult.message}
              </Typography>
            </>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default HomeSection;
