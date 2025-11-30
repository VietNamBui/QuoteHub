import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { api } from "../../config/api";
import TweetCard from "../HomeSection/TweetCard";

const AdminModerationPage = () => {
  const [loading, setLoading] = useState(false);
  const [aiItems, setAiItems] = useState([]);
  const [reportedItems, setReportedItems] = useState([]);
  const [tab, setTab] = useState("ai"); // "ai" | "reports"

  const loadPending = async () => {
    try {
      setLoading(true);
      const [aiRes, reportRes] = await Promise.all([
        api.get("/api/moderation/twits/pending"),
        api.get("/api/reports/pending"),
      ]);

      setAiItems(Array.isArray(aiRes.data) ? aiRes.data : []);
      setReportedItems(Array.isArray(reportRes.data) ? reportRes.data : []);
    } catch (e) {
      console.error("Không thể tải danh sách bài bị báo cáo", e);
      toast.error("Không thể tải danh sách bài bị báo cáo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      await api.post(`/api/moderation/twits/${id}/approve`);
      toast.success("Đã duyệt bài viết");
      setAiItems((prev) => prev.filter((t) => t.id !== id));
      setReportedItems((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      console.error("Không thể duyệt bài viết", e);
      const msg = e.response?.data || e.response?.data?.message || "Không thể duyệt bài";
      toast.error(msg);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Lý do từ chối bài viết này?", "Vi phạm tiêu chuẩn cộng đồng");
    if (!reason) return;
    try {
      await api.post(`/api/moderation/twits/${id}/reject`, { reason });
      toast.success("Đã từ chối bài viết");
      if (tab === "ai") {
        setAiItems((prev) => prev.filter((t) => t.id !== id));
      } else {
        setReportedItems((prev) => prev.filter((t) => t.id !== id));
      }
    } catch (e) {
      console.error("Không thể từ chối bài viết", e);
      const msg = e.response?.data || e.response?.data?.message || "Không thể từ chối bài";
      toast.error(msg);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
          Moderation - Bài bị báo cáo / nghi ngờ
        </Typography>
        <Button variant="outlined" size="small" onClick={loadPending}>
          Tải lại
        </Button>
      </Stack>

      {/* Tabs đơn giản cho AI vs User report */}
      <Box sx={{ mb: 2, borderBottom: "1px solid rgba(148,163,184,0.4)" }}>
        <Stack direction="row" spacing={2}>
          <Button
            size="small"
            variant={tab === "ai" ? "contained" : "text"}
            onClick={() => setTab("ai")}
          >
            AI nghi ngờ
          </Button>
          <Button
            size="small"
            variant={tab === "reports" ? "contained" : "text"}
            onClick={() => setTab("reports")}
          >
            User báo cáo
          </Button>
        </Stack>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      )}
      {!loading && (tab === "ai" ? aiItems : reportedItems).length === 0 && (
        <Box sx={{ py: 6, textAlign: "center", borderRadius: 4, border: "1px dashed rgba(148,163,184,0.4)" }}>
          <Typography sx={{ color: "rgba(15,23,42,0.6)" }}>
            Hiện không có bài nào đang chờ kiểm duyệt.
          </Typography>
        </Box>
      )}

      <Stack spacing={3} sx={{ mt: 1 }}>
        {(tab === "ai" ? aiItems : reportedItems).map((twit) => (
          <Box
            key={twit.id}
            sx={{
              borderRadius: 3,
              border: "1px solid rgba(148,163,184,0.35)",
              p: 1.5,
              bgcolor: "#f8fafc",
            }}
          >
            <TweetCard item={twit} />

            {(() => {
              const status = twit.moderationStatus;
              const reasonFromBackend = twit.moderationReason;
              let displayReason = reasonFromBackend;

              if (!displayReason) {
                if (status === "PENDING") {
                  displayReason = "AI nghi ngờ một số điểm. Bài đang chờ duyệt thêm.";
                } else if (status === "REJECTED") {
                  displayReason = "Bài đã bị từ chối bởi admin.";
                }
              }

              if (!displayReason) return null;

              return (
              <Box
                sx={{
                  mt: 1,
                  px: 1.5,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: "#fef3c7",
                  border: "1px solid #facc15",
                }}
              >
                <Typography variant="caption" sx={{ color: "#92400e" }}>
                  Lý do kiểm duyệt: {displayReason}
                </Typography>
              </Box>
              );
            })()}

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => handleReject(twit.id)}
              >
                Từ chối
              </Button>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => handleApprove(twit.id)}
              >
                Duyệt
              </Button>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default AdminModerationPage;
