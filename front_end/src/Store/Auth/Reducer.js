import {
  FIND_USER_BY_ID_SUCCESS,
  FOLLOW_USER_SUCCESS,
  GET_USER_PROFILE_FAILURE,
  GET_USER_PROFILE_REQUEST,
  GET_USER_PROFILE_SUCCESS,
  LOGIN_USER_FAILURE,
  LOGIN_USER_REQUEST,
  LOGIN_USER_SUCCESS,
  LOGOUT,
  REGISTER_USER_FAILURE,
  REGISTER_USER_REQUEST,
  REGISTER_USER_SUCCESS,
  UPDATE_USER_SUCCESS,
} from "./ActionType";

const initialState = {
  user: null,
  loading: false,
  error: null,
  jwt: null,
  registerSuccess: false,
  loginSuccess: false,
  pendingEmail: null,
};

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_USER_REQUEST:
    case REGISTER_USER_REQUEST:
    case GET_USER_PROFILE_REQUEST:
      return { ...state, loading: true, error: null, loginSuccess: false };

    case LOGIN_USER_SUCCESS:
    case REGISTER_USER_SUCCESS:
      return { ...state, loading: false, error: null, jwt: action.payload };

    case GET_USER_PROFILE_SUCCESS:
      // Chuẩn hoá lại user để FE luôn dùng field followings
      return {
        ...state,
        loading: false,
        error: null,
        user: action.payload
          ? {
              ...action.payload,
              // Backend dùng "following" nên map sang "followings" cho RightPart, TweetCard dùng
              followings:
                action.payload.followings || action.payload.following || [],
            }
          : action.payload,
      };

    case FIND_USER_BY_ID_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        findUser: action.payload,
      };

    case UPDATE_USER_SUCCESS:
      // Merge dữ liệu user mới trả về vào state hiện tại
      const updated = action.payload;
      const mergedUser = state.user
        ? {
            ...state.user,
            ...updated,
            // giữ lại followings đã chuẩn hoá
            followings: state.user.followings || state.user.following || [],
          }
        : updated;
      const mergedFindUser = state.findUser && state.findUser.id === updated.id
        ? {
            ...state.findUser,
            ...updated,
            // giữ lại cờ req_user để vẫn hiển thị Edit Profile cho chính mình
            req_user: state.findUser.req_user,
          }
        : state.findUser;
      return {
        ...state,
        loading: false,
        error: null,
        user: mergedUser,
        findUser: mergedFindUser,
      };

    case FOLLOW_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        findUser: action.payload,
        user: state.user
          ? {
              ...state.user,
              followings: (() => {
                // Ưu tiên dùng followings nếu đã chuẩn hoá, fallback sang following từ backend
                const current =
                  state.user.followings || state.user.following || [];
                const updated = action.payload;
                const exists = current.some((u) => u.id === updated.id);
                // backend trả về user được follow/unfollow với cờ updated.followed
                if (updated.followed && !exists) {
                  return [...current, updated];
                }
                if (!updated.followed && exists) {
                  return current.filter((u) => u.id !== updated.id);
                }
                return current;
              })(),
            }
          : state.user,
      };

    case LOGOUT:
      return initialState;

    case LOGIN_USER_FAILURE:
    case REGISTER_USER_FAILURE:
    case GET_USER_PROFILE_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case "REGISTER_REQUEST":
    case "LOGIN_REQUEST":
      return { ...state, loading: true, error: null, loginSuccess: false };

    case "REGISTER_SUCCESS":
      return { ...state, loading: false, registerSuccess: true };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        // lưu jwt nhận từ backend, không dùng payload làm user
        jwt: action.payload?.jwt || state.jwt,
        loginSuccess: true,
        pendingEmail: null,
      };

    case "LOGIN_2FA_REQUIRED":
      return {
        ...state,
        loading: false,
        error: null,
        pendingEmail: action.payload,
      };

    case "REGISTER_FAIL":
    case "LOGIN_FAIL":
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};
