import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { api } from "../../config/api";
import { Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import { connectEmailImportSocket } from "../../Utils/emailImportSocket";

const KindleEmailImportPage = () => {
  const { auth } = useSelector((store) => store);

  const [emailAddress, setEmailAddress] = useState("");
  const [emailLoading, setEmailLoading] = useState(true);
  const [emailError, setEmailError] = useState("");

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        setEmailLoading(true);
        setEmailError("");
        const { data } = await api.get("/api/email/import-address");
        setEmailAddress(data || "");
      } catch (err) {
        setEmailError("Không thể tải địa chỉ email import. Hãy thử tải lại trang.");
      } finally {
        setEmailLoading(false);
      }
    };

    const fetchHistory = async () => {
      try {
        setHistoryLoading(true);
        setHistoryError("");
        const { data } = await api.get("/api/email/import-history");
        const list = Array.isArray(data) ? data : [];
        setHistory(list);
      } catch (err) {
        setHistoryError("Không thể tải lịch sử các email đã import.");
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchEmail();
    fetchHistory();

    const userId = auth?.user?.id;
    const disconnect = connectEmailImportSocket(userId, (log) => {
      if (!log) return;
      // tránh trùng id nếu đã có trong danh sách
      setHistory((prev) => {
        if (prev.find((item) => item.id === log.id)) return prev;
        return [log, ...prev];
      });
    });

    return () => {
      disconnect && disconnect();
    };
  }, [auth?.user?.id]);

  const handleCopy = async () => {
    if (!emailAddress) return;
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopyMessage("Đã sao chép địa chỉ email.");
      setTimeout(() => setCopyMessage(""), 2000);
    } catch (err) {
      setCopyMessage("Không thể sao chép. Hãy copy thủ công.");
      setTimeout(() => setCopyMessage(""), 3000);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
        Kindle Email Import
      </Typography>

      <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.7)", mb: 3 }}>
        Gửi file highlight hoặc sách từ Kindle của bạn tới địa chỉ email bên dưới. Hệ thống sẽ tự
        động đọc file HTML và tạo các đoạn quote gắn với sách trong tài khoản của bạn.
      </Typography>

      <Box
        sx={{
          borderRadius: 3,
          border: "1px solid rgba(15,23,42,0.12)",
          p: 3,
          bgcolor: "rgba(248,250,252,0.9)",
          mb: 3,
        }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, color: "rgba(15,23,42,0.8)" }}>
          Địa chỉ email Kindle của bạn
        </Typography>

        {emailLoading ? (
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={22} />
            <Typography variant="body2">Đang tải địa chỉ email...</Typography>
          </Box>
        ) : emailError ? (
          <Typography variant="body2" sx={{ color: "#dc2626" }}>
            {emailError}
          </Typography>
        ) : (
          <Box display="flex" gap={1.5} alignItems="center" flexWrap="wrap">
            <TextField
              value={emailAddress}
              size="small"
              fullWidth
              InputProps={{ readOnly: true }}
            />
            <Button
              variant="contained"
              onClick={handleCopy}
              sx={{ whiteSpace: "nowrap", borderRadius: 2, px: 3, fontWeight: 600 }}
            >
              Copy
            </Button>
          </Box>
        )}

        <Typography
          variant="caption"
          sx={{ display: "block", mt: 1.5, color: "rgba(15,23,42,0.7)" }}
        >
          Hãy thêm địa chỉ này vào danh sách email được phép gửi tài liệu trong Kindle và chọn
          "Share" / "Send to" để gửi highlight hoặc sách tới đây.
        </Typography>

        {copyMessage && (
          <Typography sx={{ mt: 1.5, color: "#16a34a" }}>{copyMessage}</Typography>
        )}
      </Box>

      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
          Lịch sử các email đã gửi
        </Typography>

        {historyLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="120px">
            <CircularProgress />
          </Box>
        ) : historyError ? (
          <Typography variant="body2" sx={{ color: "#dc2626" }}>
            {historyError}
          </Typography>
        ) : !history.length ? (
          <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.7)", mt: 1 }}>
            Chưa có email import nào. Hãy gửi file Kindle đầu tiên của bạn tới địa chỉ email ở
            trên.
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
                  {item.subject || "(Không có tiêu đề)"}
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.8)", mb: 0.5 }}>
                  Từ: {item.senderEmail || "(Không xác định)"}
                </Typography>
                <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.75)", mb: 0.75 }}>
                  File: {item.fileName || "(Không rõ tên file)"}
                </Typography>
                <Typography variant="caption" sx={{ color: "rgba(15,23,42,0.6)" }}>
                  Thời gian: {item.receivedAt ? new Date(item.receivedAt).toLocaleString() : "?"}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default KindleEmailImportPage;
