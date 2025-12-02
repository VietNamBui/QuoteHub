import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../config/api";
import { Box, CircularProgress, Grid, Paper, Typography, Tabs, Tab } from "@mui/material";
import KindleImportPage from "./KindleImportPage";
import KindleEmailImportPage from "./KindleEmailImportPage";
import MoreClassificationPage from "./MoreClassificationPage";

const MorePage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.initialTab || "books");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/api/quotes/books/me");
        setBooks(Array.isArray(data) ? data : []);
      } catch (err) {
        setError("Không thể tải danh sách sách");
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const handleOpenBook = (bookId) => {
    navigate(`/more/books/${bookId}`);
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
        <Tab
          label="Classification"
          value="classification"
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
              {books.map((book) => (
                <Grid item xs={12} sm={6} md={4} key={book.id}>
                  <Paper
                    elevation={4}
                    onClick={() => handleOpenBook(book.id)}
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
                    <Typography variant="subtitle2" sx={{ color: "rgba(15,23,42,0.6)", mb: 0.5 }}>
                      {book.author} {book.year ? `· ${book.year}` : ""}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {book.title}
                    </Typography>
                    {typeof book.quotesCount === "number" && (
                      <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.65)" }}>
                        {book.quotesCount} đoạn quote
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
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

      {tab === "classification" && (
        <Box>
          <MoreClassificationPage />
        </Box>
      )}
    </Box>
  );
};

export default MorePage;
