import React, { useState } from "react";
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Typography } from "@mui/material";
import { api } from "../../config/api";

const UnclassifiedModal = ({ open, handleClose, quotes, onAfterClassify }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const maxPerBatch = 10;

  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(0, maxPerBatch)
    );
  };

  const handleSubmit = async () => {
    if (selectedIds.length === 0) return;
    try {
      setLoading(true);
      await api.post("/api/quotes/classify", { quoteIds: selectedIds });
      setSelectedIds([]);
      if (onAfterClassify) onAfterClassify();
      handleClose();
    } catch (err) {
      console.error("Lỗi phân loại", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseInternal = () => {
    setSelectedIds([]);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleCloseInternal} fullWidth maxWidth="sm">
      <DialogTitle>Phân loại các đoạn trích</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Chọn từ 1 đến {maxPerBatch} đoạn trích để gửi lên AI model phân loại.
        </Typography>
        {quotes.length === 0 ? (
          <Typography variant="body2">Không còn đoạn trích chưa phân loại.</Typography>
        ) : (
          <Box sx={{ maxHeight: 360, overflowY: "auto" }}>
            {quotes.map((q) => (
              <Box key={q.id} sx={{ mb: 1.5, p: 1.5, borderRadius: 2, border: "1px solid rgba(148,163,184,0.4)" }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedIds.includes(q.id)}
                      onChange={() => handleToggle(q.id)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        {q.highlight?.length > 160 ? q.highlight.slice(0, 160) + "..." : q.highlight}
                      </Typography>
                      {q.bookTitle && (
                        <Typography variant="caption" sx={{ color: "rgba(100,116,139,0.9)" }}>
                          {q.bookTitle} {q.bookAuthor ? `· ${q.bookAuthor}` : ""}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseInternal} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || selectedIds.length === 0}
          sx={{ borderRadius: 999, textTransform: "none", fontWeight: 600 }}
        >
          Gửi phân loại
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnclassifiedModal;
