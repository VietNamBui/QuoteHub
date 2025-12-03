import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { api } from "../../config/api";
import { Box, Button, CircularProgress, Typography } from "@mui/material";

const KindleImportPage = () => {
  const { auth } = useSelector((store) => store);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [historySuccess, setHistorySuccess] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files?.[0] || null);
    setMessage("");
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Hãy chọn file HTML export từ Kindle trước.");
      return;
    }
    if (!auth.user?.id) {
      setError("Không tìm thấy thông tin người dùng. Hãy đăng nhập lại.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", auth.user.id);

      await api.post("/api/upload-kindle", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage("Import Kindle thành công. Vào tab Books để xem các quote mới.");

      // Sau khi upload thành công, tải lại lịch sử
      fetchHistory();
    } catch (err) {
      setError("Upload thất bại. Hãy kiểm tra lại file HTML export từ Kindle.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      setHistoryError("");
      setHistorySuccess("");
      const { data } = await api.get("/api/kindle/import-history");
      const list = Array.isArray(data) ? data : [];
      setHistory(list);
    } catch (err) {
      setHistoryError("Không thể tải lịch sử các lần import.");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Import quote từ Kindle
      </Typography>
      <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.7)", mb: 3 }}>
        Tải lên file HTML export từ ứng dụng Kindle mobile hoặc Kindle web. Hệ thống sẽ tự động
        đọc các đoạn highlight và lưu thành quote gắn với sách và tài khoản của bạn.
      </Typography>

      <Box
        sx={{
          borderRadius: 3,
          border: "1px dashed rgba(15,23,42,0.2)",
          p: 3,
          bgcolor: "rgba(248,250,252,0.9)",
          mb: 3,
        }}
      >
        <input type="file" accept=".html,.htm" onChange={handleFileChange} />
        <Typography variant="caption" sx={{ display: "block", mt: 1, color: "rgba(15,23,42,0.6)" }}>
          Chỉ hỗ trợ file HTML export từ Kindle (Your Notes and Highlights).
        </Typography>
      </Box>

      <Button
        variant="contained"
        disabled={loading}
        onClick={handleUpload}
        sx={{ borderRadius: 3, px: 4, py: 1.4, fontWeight: 600 }}
      >
        {loading ? <CircularProgress size={22} sx={{ color: "white" }} /> : "Tải lên và import"}
      </Button>

      {message && (
        <Typography sx={{ mt: 2, color: "#16a34a" }}>{message}</Typography>
      )}
      {error && (
        <Typography sx={{ mt: 2, color: "#dc2626" }}>{error}</Typography>
      )}

      <Box sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Lịch sử các lần import file
          </Typography>
          {history.length > 0 && (
            <Button
              variant="text"
              color="error"
              size="small"
              onClick={async () => {
                if (!window.confirm("Bạn có chắc muốn xoá toàn bộ lịch sử import file?")) return;
                try {
                  await api.delete("/api/kindle/import-history");
                  setHistory([]);
                  setHistoryError("");
                  setHistorySuccess("Đã xoá toàn bộ lịch sử import file.");
                } catch (err) {
                  alert("Không thể xoá lịch sử. Hãy thử lại sau.");
                }
              }}
              sx={{ textTransform: "none", fontWeight: 600 }}
            >
              Xoá tất cả lịch sử
            </Button>
          )}
        </Box>

        {historyLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="120px">
            <CircularProgress />
          </Box>
        ) : historyError ? (
          <Typography variant="body2" sx={{ color: "#dc2626" }}>
            {historyError}
          </Typography>
        ) : historySuccess ? (
          <Typography variant="body2" sx={{ color: "#16a34a", mt: 1 }}>
            {historySuccess}
          </Typography>
        ) : !history.length ? (
          <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.7)", mt: 1 }}>
            Chưa có lần import nào. Hãy tải lên file Kindle đầu tiên của bạn.
          </Typography>
        ) : (
          <Box display="flex" flexDirection="column" gap={2.5} mt={1}>
            {history.map((item) => (
              <Box
                key={item.id}
                sx={{
                  borderRadius: 3,
                  border: "1px solid rgba(15,23,42,0.08)",
                  p: 2,
                  bgcolor: "#ffffff",
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  {item.fileName || "(Không rõ tên file)"}
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(15,23,42,0.6)" }}>
                  Thời gian: {item.importedAt ? new Date(item.importedAt).toLocaleString() : "?"}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default KindleImportPage;
