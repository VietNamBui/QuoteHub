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
        <Route
          path='/*'
          element={
            jwt
              ? auth.user
                ? <HomePage />
                : <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', color: '#64748b' }}>
                    Đang tải phiên đăng nhập...
                  </div>
              : <Authentication />
          }
        />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
