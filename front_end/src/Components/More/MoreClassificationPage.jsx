import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../config/api";
import { Box, CircularProgress, Grid, Paper, Typography, Button } from "@mui/material";
import UnclassifiedModal from "./UnclassifiedModal";

const MoreClassificationPage = () => {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unclassified, setUnclassified] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const fetchLabels = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/api/labels/me");
      setLabels(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Không thể tải danh sách thể loại");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnclassified = async () => {
    try {
      const { data } = await api.get("/api/quotes/unclassified");
      setUnclassified(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Không thể tải quote chưa phân loại", err);
    }
  };

  useEffect(() => {
    fetchLabels();
    fetchUnclassified();
  }, []);

  const handleOpenLabel = (labelId) => {
    navigate(`/more/labels/${labelId}`);
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleAfterClassify = () => {
    fetchLabels();
    fetchUnclassified();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
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

  const unclassifiedCount = unclassified.length;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Phân loại các đoạn trích theo thể loại
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Card "Chưa phân loại" */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper
            elevation={4}
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: "#ffffff",
              border: "1px solid rgba(15,23,42,0.06)",
            }}
          >
            <Typography variant="subtitle2" sx={{ color: "rgba(15,23,42,0.6)", mb: 0.5 }}>
              Trạng thái
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              Chưa phân loại
            </Typography>
            <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.7)", mb: 1.5 }}>
              {unclassifiedCount} đoạn trích chưa được gán thể loại.
            </Typography>
            <Button
              variant="contained"
              size="small"
              disabled={unclassifiedCount === 0}
              onClick={handleOpenModal}
              sx={{ borderRadius: 999, textTransform: "none", fontWeight: 600 }}
            >
              Bắt đầu phân loại
            </Button>
          </Paper>
        </Grid>

        {/* Card từng label */}
        {labels.map((label) => (
          <Grid item xs={12} sm={6} md={4} key={label.id}>
            <Paper
              elevation={4}
              onClick={() => handleOpenLabel(label.id)}
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
                Thể loại
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                {label.name}
              </Typography>
              <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.65)" }}>
                {label.quotesCount} đoạn trích
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <UnclassifiedModal
        open={openModal}
        handleClose={handleCloseModal}
        quotes={unclassified}
        onAfterClassify={handleAfterClassify}
      />
    </Box>
  );
};

export default MoreClassificationPage;
