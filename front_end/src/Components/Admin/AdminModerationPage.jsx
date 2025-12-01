import React, { useEffect, useState } from "react";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { api } from "../../config/api";
import TweetCard from "../HomeSection/TweetCard";
import { connectModerationSocket } from "../../Utils/moderationSocket";

const AdminModerationPage = () => {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("ai"); // "ai" | "reports"
  const [subTab, setSubTab] = useState("pending"); // "pending" | "approved" | "rejected" | "blocked" (AI only)

  // Các id twit mới được thêm gần đây để highlight
  const [highlightIds, setHighlightIds] = useState([]);
  const [initialized, setInitialized] = useState(false);

  // AI nghi ngờ
  const [aiPending, setAiPending] = useState([]);
  const [aiApproved, setAiApproved] = useState([]);
  const [aiRejected, setAiRejected] = useState([]);
  const [aiBlocked, setAiBlocked] = useState([]);

  // User báo cáo
  const [repPending, setRepPending] = useState([]);
  const [repApproved, setRepApproved] = useState([]);
  const [repRejected, setRepRejected] = useState([]);

  const loadPending = async () => {
    try {
      setLoading(true);
      const [aiRes, reportRes] = await Promise.all([
        api.get("/api/moderation/twits/pending"),
        api.get("/api/reports/pending"),
      ]);

      const aiList = Array.isArray(aiRes.data) ? aiRes.data : [];
      const repList = Array.isArray(reportRes.data) ? reportRes.data : [];

      // Nếu là lần load đầu tiên, chỉ khởi tạo danh sách, không highlight
      if (initialized) {
        // Tính các id mới xuất hiện trong pending để highlight
        const prevAiIds = aiPending.map((t) => t.id);
        const prevRepIds = repPending.map((t) => t.id);
        const newAiIds = aiList.filter((t) => !prevAiIds.includes(t.id)).map((t) => t.id);
        const newRepIds = repList.filter((t) => !prevRepIds.includes(t.id)).map((t) => t.id);
        const newIds = [...newAiIds, ...newRepIds];

        if (newIds.length > 0) {
          setHighlightIds((prev) => {
            const set = new Set(prev);
            newIds.forEach((id) => set.add(id));
            return Array.from(set);
          });
          // Xoá highlight sau 3 giây
          setTimeout(() => {
            setHighlightIds((prev) => prev.filter((id) => !newIds.includes(id)));
          }, 3000);
        }
      }

      setAiPending(aiList);
      setAiApproved([]);
      setAiRejected([]);
      setAiBlocked([]);

      setRepPending(repList);
      setRepApproved([]);
      setRepRejected([]);

      if (!initialized) {
        setInitialized(true);
      }
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

  // Realtime: lắng nghe thay đổi moderation qua WebSocket
  useEffect(() => {
    const disconnect = connectModerationSocket(() => {
      // Nếu đang xem PENDING thì reload pending, ngược lại kích hoạt lại effect loadByStatus
      if (subTab === "pending") {
        loadPending();
      } else {
        setSubTab((prev) => prev); // giữ nguyên nhưng kích hoạt lại useEffect phụ thuộc subTab
      }
    });

    return () => {
      disconnect && disconnect();
    };
  }, [subTab, tab]);

  // Load theo trạng thái khi đổi subTab hoặc tab lớn
  useEffect(() => {
    const loadByStatus = async () => {
      try {
        setLoading(true);
        if (tab === "ai") {
          if (subTab === "approved") {
            const res = await api.get("/api/moderation/twits", { params: { status: "APPROVED" } });
            setAiApproved(Array.isArray(res.data) ? res.data : []);
          } else if (subTab === "rejected") {
            const res = await api.get("/api/moderation/twits", { params: { status: "REJECTED" } });
            setAiRejected(Array.isArray(res.data) ? res.data : []);
          } else if (subTab === "blocked") {
            const res = await api.get("/api/moderation/twits", { params: { status: "BLOCKED" } });
            setAiBlocked(Array.isArray(res.data) ? res.data : []);
          } else {
            // pending đã được load bằng loadPending
          }
        } else {
          if (subTab === "approved") {
            const res = await api.get("/api/reports/by-status", { params: { status: "APPROVED" } });
            setRepApproved(Array.isArray(res.data) ? res.data : []);
          } else if (subTab === "rejected") {
            const res = await api.get("/api/reports/by-status", { params: { status: "REJECTED" } });
            setRepRejected(Array.isArray(res.data) ? res.data : []);
          } else {
            // pending đã được load bằng loadPending
          }
        }
      } catch (e) {
        console.error("Không thể tải danh sách theo trạng thái", e);
      } finally {
        setLoading(false);
      }
    };

    // Chỉ gọi API khi không phải pending
    if (subTab !== "pending") {
      loadByStatus();
    }
  }, [tab, subTab]);

  const handleApprove = async (id) => {
    try {
      // Nút chính: chấp nhận cảnh báo/báo cáo => ẩn bài (gọi /reject)
      let reason = "Bài viết vi phạm sau khi xem xét";
      if (tab === "ai") {
        const input = window.prompt(
          "Lý do ẩn bài này?",
          "Bài viết vi phạm sau khi xem xét cảnh báo của AI"
        );
        if (!input) return;
        reason = input;
      } else {
        reason = "Bài viết vi phạm sau khi xem xét báo cáo của người dùng";
      }

      await api.post(`/api/moderation/twits/${id}/reject`, { reason });
      toast.success("Đã chấp nhận cảnh báo/báo cáo, bài sẽ bị ẩn khỏi bảng tin");
      // Sau khi duyệt, reload danh sách hiện tại
      if (subTab === "pending") {
        loadPending();
      } else {
        // Nếu đang xem tab approved/rejected, gọi lại effect loadByStatus bằng cách setSubTab cho chính nó
        setSubTab((prev) => prev);
      }
    } catch (e) {
      console.error("Không thể duyệt bài viết", e);
      const msg = e.response?.data || e.response?.data?.message || "Không thể duyệt bài";
      toast.error(msg);
    }
  };

  const handleReject = async (id) => {
    try {
      // Nút phụ: bỏ qua cảnh báo/báo cáo, giữ bài lại (gọi /approve)
      await api.post(`/api/moderation/twits/${id}/approve`);
      toast.success(
        tab === "ai" ? "Đã bỏ qua cảnh báo, bài vẫn hiển thị" : "Đã từ chối báo cáo, bài vẫn hiển thị"
      );

      if (subTab === "pending") {
        loadPending();
      } else {
        setSubTab((prev) => prev);
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

      {/* Sub-tabs: PENDING / APPROVED / REJECTED */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1.5}>
          <Button
            size="small"
            variant={subTab === "pending" ? "contained" : "text"}
            onClick={() => setSubTab("pending")}
          >
            {tab === "ai" ? "Đang chờ duyệt" : "Báo cáo chờ xử lý"}
          </Button>
          <Button
            size="small"
            variant={subTab === "approved" ? "contained" : "text"}
            onClick={() => setSubTab("approved")}
          >
            {tab === "ai" ? "Bài được cho phép" : "Báo cáo bị từ chối (bài giữ lại)"}
          </Button>
          <Button
            size="small"
            variant={subTab === "rejected" ? "contained" : "text"}
            onClick={() => setSubTab("rejected")}
          >
            {tab === "ai" ? "Bài bị ẩn (vi phạm)" : "Bài vi phạm (báo cáo đúng)"}
          </Button>
          {tab === "ai" && (
            <Button
              size="small"
              variant={subTab === "blocked" ? "contained" : "text"}
              onClick={() => setSubTab("blocked")}
            >
              Bị chặn
            </Button>
          )}
        </Stack>
      </Box>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      )}
      {!loading && (() => {
        const list =
          tab === "ai"
            ? subTab === "pending"
              ? aiPending
              : subTab === "approved"
              ? aiApproved
              : subTab === "rejected"
              ? aiRejected
              : aiBlocked
            : subTab === "pending"
            ? repPending
            : subTab === "approved"
            ? repApproved
            : repRejected;
        return list.length === 0;
      })() && (
        <Box sx={{ py: 6, textAlign: "center", borderRadius: 4, border: "1px dashed rgba(148,163,184,0.4)" }}>
          <Typography sx={{ color: "rgba(15,23,42,0.6)" }}>
            Hiện không có bài nào đang chờ kiểm duyệt.
          </Typography>
        </Box>
      )}

      <Stack spacing={3} sx={{ mt: 1 }}>
        {(() => {
          const list =
            tab === "ai"
              ? subTab === "pending"
                ? aiPending
                : subTab === "approved"
                ? aiApproved
                : subTab === "rejected"
                ? aiRejected
                : aiBlocked
              : subTab === "pending"
              ? repPending
              : subTab === "approved"
              ? repApproved
              : repRejected;
          return list;
        })().map((twit) => (
          <Box
            key={twit.id}
            sx={{
              borderRadius: 3,
              border: highlightIds.includes(twit.id)
                ? "1px solid #fdba74"
                : "1px solid rgba(148,163,184,0.35)",
              p: 1.5,
              bgcolor: highlightIds.includes(twit.id) ? "#fff7ed" : "#f8fafc",
              transition: "background-color 0.4s ease, border-color 0.4s ease",
            }}
          >
            <TweetCard item={twit} />

            {(() => {
              const status = twit.moderationStatus;
              const reasonFromBackend = twit.moderationReason;
              let displayReason = reasonFromBackend;

              // Chỉ hiển thị box lý do cho PENDING/REJECTED, không hiển thị cho APPROVED
              if (status !== "APPROVED" && !displayReason) {
                if (status === "PENDING") {
                  displayReason = "AI nghi ngờ một số điểm. Bài đang chờ duyệt thêm.";
                } else if (status === "REJECTED") {
                  displayReason = "Bài đã bị từ chối bởi admin.";
                }
              }

              if (!displayReason || status === "APPROVED") return null;

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

            {subTab === "pending" && (
              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={() => handleReject(twit.id)}
                >
                  {tab === "ai" ? "Bỏ qua cảnh báo (giữ bài)" : "Từ chối báo cáo (giữ bài)"}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  onClick={() => handleApprove(twit.id)}
                >
                  {tab === "ai" ? "Chấp nhận cảnh báo (ẩn bài)" : "Chấp nhận báo cáo (ẩn bài)"}
                </Button>
              </Stack>
            )}
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default AdminModerationPage;
