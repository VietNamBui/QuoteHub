import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TablePagination,
} from "@mui/material";
import { api } from "../../config/api";
import { useSelector } from "react-redux";

const AdminPermissionPage = () => {
  const { auth } = useSelector((store) => store);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [confirmUser, setConfirmUser] = useState(null);

  const loadUsers = async (search) => {
    setLoading(true);
    try {
      const params = search && search.trim() ? { query: search.trim() } : {};
      const res = await api.get("/api/admin/users", { params });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("Không thể tải danh sách người dùng", e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers("");
  }, []);

  const handleToggleAdmin = async (user) => {
    if (!user || !user.id) return;
    const nextAdmin = !user.admin;
    setUpdatingId(user.id);
    try {
      const res = await api.put(`/api/admin/users/${user.id}/admin`, {
        admin: nextAdmin,
      });
      const updated = res.data;
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
      );
    } catch (e) {
      console.error("Không thể cập nhật quyền admin", e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadUsers(query);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestToggle = (user) => {
    setConfirmUser(user);
  };

  const handleConfirmClose = () => {
    setConfirmUser(null);
  };

  const handleConfirmAccept = async () => {
    if (!confirmUser) return;
    const target = confirmUser;
    setConfirmUser(null);
    await handleToggleAdmin(target);
  };

  const paginatedUsers =
    rowsPerPage > 0
      ? users.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      : users;

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Phân quyền người dùng
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          p: 2,
          mb: 2,
        }}
      >
        <form onSubmit={handleSearchSubmit}>
          <TextField
            size="small"
            label="Tìm theo tên hoặc email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            sx={{ width: "100%", maxWidth: 360, mr: 2 }}
          />
          <Button
            type="submit"
            size="small"
            variant="contained"
            sx={{ ml: { xs: 0, sm: 1 }, mt: { xs: 1, sm: 0 } }}
          >
            Tìm kiếm
          </Button>
          <Button
            type="button"
            size="small"
            variant="text"
            sx={{ ml: 1, mt: { xs: 1, sm: 0 } }}
            onClick={() => {
              setQuery("");
              loadUsers("");
            }}
          >
            Xoá lọc
          </Button>
        </form>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          borderRadius: 3,
          p: 0,
        }}
      >
        {loading ? (
          <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
            <CircularProgress size={28} />
          </Box>
        ) : users.length === 0 ? (
          <Box sx={{ p: 3 }}>
            <Typography variant="body2" sx={{ color: "rgba(15,23,42,0.7)" }}>
              Không tìm thấy người dùng nào.
            </Typography>
          </Box>
        ) : (
          <React.Fragment>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell align="center">Followers</TableCell>
                  <TableCell align="center">Quyền</TableCell>
                  <TableCell align="right">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>{user.fullName || "(Chưa có tên)"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell align="center">
                      {Array.isArray(user.followers) ? user.followers.length : 0}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={user.admin ? "Admin" : "User"}
                        color={user.admin ? "primary" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {auth.user && auth.user.id === user.id ? (
                        <Button
                          size="small"
                          variant="outlined"
                          disabled
                          sx={{
                            borderStyle: "dashed",
                            color: "rgba(15,23,42,0.5)",
                            borderColor: "rgba(148,163,184,0.8)",
                          }}
                        >
                          Không thể tự thay đổi quyền của chính bạn
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          variant={user.admin ? "outlined" : "contained"}
                          onClick={() => handleRequestToggle(user)}
                          disabled={updatingId === user.id}
                        >
                          {updatingId === user.id ? (
                            <CircularProgress size={16} />
                          ) : user.admin ? (
                            "Hạ xuống User"
                          ) : (
                            "Nâng quyền Admin"
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={users.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25]}
              labelRowsPerPage="Số dòng mỗi trang"
            />
          </React.Fragment>
        )}
      </Paper>

      <Dialog open={Boolean(confirmUser)} onClose={handleConfirmClose}>
        <DialogTitle>Đổi quyền người dùng</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmUser &&
              `Bạn có chắc muốn ${
                confirmUser.admin ? "hạ quyền Admin xuống User" : "nâng quyền User lên Admin"
              } cho tài khoản ${confirmUser.email}?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmClose}>Huỷ</Button>
          <Button onClick={handleConfirmAccept} autoFocus>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPermissionPage;
