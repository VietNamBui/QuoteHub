import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../config/api";
import { Box, Card, CardContent, CircularProgress, Divider, Typography } from "@mui/material";

const BookQuotesPage = () => {
  const { bookId } = useParams();
  const [quotes, setQuotes] = useState([]);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/quotes/book/${bookId}`);
        setQuotes(data || []);
        if (data && data.length > 0) {
          setBook(data[0].book || null);
        }
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
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default BookQuotesPage;
