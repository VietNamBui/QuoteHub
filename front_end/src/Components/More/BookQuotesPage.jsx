import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../config/api";
import { Box, Card, CardContent, CircularProgress, Divider, Typography, Button } from "@mui/material";
import { toast } from "react-toastify";

const BookQuotesPage = () => {
  const { bookId } = useParams();
  const [quotes, setQuotes] = useState([]);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingBook, setDeletingBook] = useState(false);
  const [deletingQuoteId, setDeletingQuoteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/quotes/book/${bookId}`);
        setQuotes(data || []);
      } catch (err) {
        setError("Không thể tải danh sách quote");
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchQuotes();
    }
  }, [bookId]);

  const handleDeleteQuote = async (quoteId) => {
    if (!quoteId) return;
    const ok = window.confirm("Bạn có chắc muốn xóa đoạn quote này?");
    if (!ok) return;
    try {
      setDeletingQuoteId(quoteId);
      await api.delete(`/api/quotes/${quoteId}`);
      setQuotes((prev) => prev.filter((q) => q.id !== quoteId));
      toast.success("Đã xóa quote.");
    } catch (err) {
      alert("Xóa quote thất bại. Hãy thử lại.");
    } finally {
      setDeletingQuoteId(null);
    }
  };

  const handleDeleteBook = async () => {
    if (!bookId) return;
    const ok = window.confirm(
      "Bạn có chắc muốn xóa toàn bộ các đoạn quote của cuốn sách này? Hành động này không thể hoàn tác."
    );
    if (!ok) return;
    try {
      setDeletingBook(true);
      await api.delete(`/api/quotes/book/${bookId}`);
      toast.success("Đã xóa toàn bộ quote của sách này.");
      navigate("/more", { replace: true });
    } catch (err) {
      alert("Xóa book thất bại. Hãy thử lại.");
    } finally {
      setDeletingBook(false);
    }
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
      <Box mb={3}>
        <Typography variant="overline" sx={{ letterSpacing: 1.2, color: "rgba(15,23,42,0.6)" }}>
          Book Quotes
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {book ? book.title : "Các đoạn quote"}
        </Typography>
        {book && (
          <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.7)", mt: 0.5 }}>
            {book.author} · {book.year}
          </Typography>
        )}

        {quotes.length > 0 && (
          <Box mt={2}>
            <Button
              variant="outlined"
              color="error"
              size="small"
              disabled={deletingBook}
              onClick={handleDeleteBook}
            >
              {deletingBook ? "Đang xóa..." : "Xóa toàn bộ quote của sách này"}
            </Button>
          </Box>
        )}
      </Box>

      {!quotes.length ? (
        <Box textAlign="center" py={6}>
          <Typography variant="body1">Chưa có đoạn quote nào cho cuốn sách này.</Typography>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={2.5}>
          {quotes.map((q) => (
            <Card
              key={q.id}
              elevation={3}
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(15,23,42,0.06)",
              }}
            >
              <CardContent>
                <Typography variant="body1" sx={{ mb: 1.5 }}>
                  {q.highlight}
                </Typography>
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="caption" sx={{ color: "rgba(15,23,42,0.6)" }}>
                  Vị trí: {q.positionType} · {q.positionValue}
                </Typography>
                <Box mt={1.5} display="flex" justifyContent="flex-end">
                  <Button
                    variant="text"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteQuote(q.id)}
                    disabled={deletingQuoteId === q.id}
                  >
                    {deletingQuoteId === q.id ? "Đang xóa..." : "Xóa quote"}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default BookQuotesPage;
