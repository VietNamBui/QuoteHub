import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../config/api";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";

const LabelQuotesPage = () => {
  const { labelId } = useParams();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/api/labels/${labelId}/quotes`);
        setQuotes(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Không thể tải danh sách quote của thể loại này");
      } finally {
        setLoading(false);
      }
    };

    if (labelId) {
      fetchQuotes();
    }
  }, [labelId]);

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
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Các đoạn trích của thể loại
      </Typography>
      {quotes.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="body1">Chưa có đoạn trích nào thuộc thể loại này.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {quotes.map((q) => (
            <Paper
              key={q.id}
              elevation={4}
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: "#ffffff",
                border: "1px solid rgba(148,163,184,0.4)",
              }}
            >
              <Typography variant="body1" sx={{ mb: 1.5 }}>
                {q.highlight}
              </Typography>
              {(q.bookTitle || q.bookAuthor) && (
                <Typography variant="body2" sx={{ color: "rgba(100,116,139,0.9)" }}>
                  {q.bookTitle} {q.bookAuthor ? `· ${q.bookAuthor}` : ""}
                </Typography>
              )}
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default LabelQuotesPage;
