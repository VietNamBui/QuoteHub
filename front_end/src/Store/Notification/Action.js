import { api } from "../../config/api";
import {
  GET_NOTIFICATIONS_REQUEST,
  GET_NOTIFICATIONS_SUCCESS,
  GET_NOTIFICATIONS_FAILURE,
  MARK_NOTIFICATION_READ_SUCCESS,
} from "./ActionType";

export const fetchNotifications = () => async (dispatch) => {
  try {
    dispatch({ type: GET_NOTIFICATIONS_REQUEST });
    const { data } = await api.get("/api/notifications/me");
    dispatch({ type: GET_NOTIFICATIONS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: GET_NOTIFICATIONS_FAILURE,
      payload: error.response?.data?.message || "Không thể tải thông báo",
    });
  }
};

export const markNotificationRead = (id) => async (dispatch) => {
  try {
    await api.get(`/api/notifications/${id}/read`);
    dispatch({ type: MARK_NOTIFICATION_READ_SUCCESS, payload: id });
  } catch (error) {
    // có thể log lỗi, nhưng không chặn UI
    console.error("Không thể đánh dấu thông báo đã đọc", error);
  }
};
