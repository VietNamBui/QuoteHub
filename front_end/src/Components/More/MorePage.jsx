import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../config/api";
import {
  Box,
  CircularProgress,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Button,
  Dialog,
  DialogContent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import KindleImportPage from "./KindleImportPage";
import KindleEmailImportPage from "./KindleEmailImportPage";
import { toast } from "react-toastify";

const MorePage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.initialTab || "books");
  const navigate = useNavigate();

  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/quotes/books/me");
      setBooks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Không thể tải danh sách sách");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "books") {
      fetchBooks();
    }
  }, [tab, fetchBooks]);

  const handleOpenBook = (bookId) => {
    navigate(`/more/books/${bookId}`);
  };

  const handleAnalyzeBook = async (bookId) => {
    const ok = window.confirm(
      "AI sẽ phân tích cuốn sách này và cập nhật lại phần mô tả + hashtag. Bạn có chắc muốn tiếp tục?"
    );
    if (!ok) return;

    try {
      setAiAnalyzing(true);
      await api.post(`/api/books/${bookId}/ai-enrich`);
      toast.success("Đã phân tích AI cho cuốn sách này.");
      // Refetch để lấy aiMetadata mới nhất
      fetchBooks();
    } catch (err) {
      toast.error("Phân tích AI thất bại. Hãy thử lại.");
    }
    finally {
      setAiAnalyzing(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    const ok = window.confirm(
      "Bạn có chắc muốn xóa cuốn sách này và toàn bộ các đoạn quote của nó? Hành động này không thể hoàn tác."
    );
    if (!ok) return;
    try {
      await api.delete(`/api/quotes/books/${bookId}`);
      setBooks((prev) => prev.filter((b) => b.id !== bookId));
      toast.success("Đã xóa sách và các đoạn quote liên quan.");
    } catch (err) {
      alert("Xóa sách thất bại. Hãy thử lại.");
    }
  };

  const handleTabChange = (event, value) => {
    setTab(value);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py={6}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: "1px solid rgba(15,23,42,0.08)" }}
      >
        <Tab
          label="Books"
          value="books"
          sx={{ textTransform: "none", fontWeight: 600, mr: 2 }}
        />
        <Tab
          label="Kindle Import"
          value="kindle"
          sx={{ textTransform: "none", fontWeight: 600 }}
        />
        <Tab
          label="Kindle Email Import"
          value="kindleEmail"
          sx={{ textTransform: "none", fontWeight: 600, ml: 2 }}
        />
      </Tabs>

      {tab === "books" && (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
            Sách từ các đoạn quote của bạn
          </Typography>
          {books.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Chưa có sách nào
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.6)" }}>
                Hãy import các đoạn quote từ Kindle để khám phá thư viện sách của bạn.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {books.map((book) => {
                let meta = null;
                if (book.aiMetadata) {
                  try {
                    meta = JSON.parse(book.aiMetadata);
                  } catch (e) {
                    // ignore parse error
                  }
                }

                return (
                  <Grid item xs={12} sm={6} md={4} key={book.id}>
                    <Paper
                      elevation={4}
                      sx={{
                        cursor: "pointer",
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: "#ffffff",
                        border: "1px solid rgba(15,23,42,0.06)",
                        transition: "all 0.2s ease",
                        ":hover": {
                          boxShadow: "0 16px 40px rgba(15,23,42,0.15)",
                          borderColor: "rgba(37,99,235,0.4)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        onClick={() => handleOpenBook(book.id)}
                      >
                        <Box>
                          {meta && Array.isArray(meta.topicTags) && meta.topicTags.length > 0 && (
                            <Box mb={0.5} sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {meta.topicTags.map((tag) => (
                                <Typography
                                  key={tag}
                                  variant="caption"
                                  sx={{
                                    backgroundColor: "rgba(37,99,235,0.06)",
                                    color: "rgba(37,99,235,0.9)",
                                    borderRadius: 999,
                                    px: 1,
                                    py: 0.2,
                                    fontWeight: 600,
                                  }}
                                >
                                  #{tag}
                                </Typography>
                              ))}
                            </Box>
                          )}
                          <Typography variant="subtitle2" sx={{ color: "rgba(15,23,42,0.6)", mb: 0.5 }}>
                            {book.author}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {book.title}
                          </Typography>
                          {meta && meta.summaryShort && (
                            <Typography
                              variant="body2"
                              sx={{ color: "rgba(15,23,42,0.8)", mb: 0.5 }}
                            >
                              {meta.summaryShort}
                            </Typography>
                          )}
                          {typeof book.quotesCount === "number" && (
                            <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.65)" }}>
                              {book.quotesCount} đoạn quote
                            </Typography>
                          )}
                        </Box>
                        <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBook(book.id);
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAnalyzeBook(book.id);
                            }}
                          >
                            Phân tích AI
                          </Button>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      )}

      {tab === "kindle" && (
        <Box>
          <KindleImportPage />
        </Box>
      )}

      {tab === "kindleEmail" && (
        <Box>
          <KindleEmailImportPage />
        </Box>
      )}

      <Dialog
        open={aiAnalyzing}
        PaperProps={{
          sx: {
            borderRadius: 3,
            px: 4,
            py: 3,
            textAlign: "center",
          },
        }}
      >
        <DialogContent>
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <CircularProgress />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              AI đang phân tích cuốn sách của bạn...
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.7)" }}>
              Vui lòng chờ trong giây lát...
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>

    </Box>
  );
};

export default MorePage;
