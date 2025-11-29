import { Route, Routes } from 'react-router-dom';
import './App.css';
import HomePage from './Components/HomePage/HomePage';
import Authentication from './Components/Authentication/Authentication';
import ResetPasswordPage from './Components/Authentication/ResetPasswordPage';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile } from './Store/Auth/Action';

// toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const { auth } = useSelector(store => store);
  // ưu tiên jwt trong redux, fallback sang localStorage khi reload
  const jwt = auth.jwt || localStorage.getItem("jwt");
  const dispatch = useDispatch();

  useEffect(() => {
    if (jwt) {
      dispatch(getUserProfile(jwt));
    }
  }, [jwt, dispatch]);

  return (
    <div>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        {/* Dùng jwt để quyết định đã đăng nhập hay chưa, tránh phụ thuộc vào user */}
        <Route path='/*' element={jwt ? <HomePage /> : <Authentication />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
