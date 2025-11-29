import {
  GET_NOTIFICATIONS_REQUEST,
  GET_NOTIFICATIONS_SUCCESS,
  GET_NOTIFICATIONS_FAILURE,
  MARK_NOTIFICATION_READ_SUCCESS,
} from "./ActionType";

const initialState = {
  loading: false,
  items: [],
  error: null,
};

export const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_NOTIFICATIONS_REQUEST:
      return { ...state, loading: true, error: null };
    case GET_NOTIFICATIONS_SUCCESS:
      return { ...state, loading: false, items: action.payload || [], error: null };
    case GET_NOTIFICATIONS_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case MARK_NOTIFICATION_READ_SUCCESS:
      return {
        ...state,
        items: state.items.map((n) =>
          n.id === action.payload ? { ...n, readFlag: true } : n
        ),
      };
    default:
      return state;
  }
};
