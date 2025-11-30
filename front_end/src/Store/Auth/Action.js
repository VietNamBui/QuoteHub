import axios from "axios"
import { api, API_BASE_URL } from "../../config/api"
import { FIND_USER_BY_ID_FAILURE, FIND_USER_BY_ID_SUCCESS, FOLLOW_USER_FAILURE, FOLLOW_USER_SUCCESS, GET_USER_PROFILE_FAILURE, GET_USER_PROFILE_SUCCESS, LOGIN_USER_FAILURE, LOGIN_USER_SUCCESS, LOGOUT, REGISTER_USER_FAILURE, REGISTER_USER_SUCCESS, UPDATE_USER_FAILURE, UPDATE_USER_SUCCESS } from "./ActionType"
import { toast } from "react-toastify";

export const loginUser = (loginData) => async (dispatch) => {
  try {
    dispatch({ type: "LOGIN_REQUEST" });

    localStorage.removeItem("jwt");
    const { data } = await axios.post(`${API_BASE_URL}/auth/signin`, loginData);
    console.log("logedin user ", data);

    if (data.twoFactorRequired) {
      // Thành công, yêu cầu nhập OTP
      dispatch({ type: "LOGIN_2FA_REQUIRED", payload: data.email });
      return;
    }

    if (data.jwt) {
      localStorage.setItem("jwt", data.jwt);
    }
    dispatch({ type: "LOGIN_SUCCESS", payload: data });

    // Sau khi đăng nhập thành công, load luôn profile để Navigation, RightPart có user ngay
    if (data.jwt) {
      dispatch(getUserProfile(data.jwt));
    }

  } catch (error) {
    console.log("error ", error);
    const msg = error.response?.data?.message || "Đăng nhập thất bại";
    dispatch({
        type: "LOGIN_FAIL",
        payload: msg,
      });
    toast.error(msg);
  }
};

// export const registerUser=(registerData)=>async(dispatch)=>{
//     try {
//         const {data}=await axios.post(`${API_BASE_URL}/auth/signup`,registerData)
//         console.log("singup user ",data)
//         if(data.jwt){
//             localStorage.setItem("jwt",data.jwt)
//         }
//         dispatch({type:REGISTER_USER_SUCCESS,payload:data.jwt})
//     } catch (error) {
//         console.log("error ",error)
//         dispatch({type:REGISTER_USER_FAILURE,payload:error.message})
//     }
// }
export const registerUser = (userData) => async (dispatch) => {
    try {
      dispatch({ type: "REGISTER_REQUEST" });
      
        // xóa token cũ trước khi đăng ký
        localStorage.removeItem("jwt");
      const { data } = await api.post("/auth/signup", userData);
  
      dispatch({ type: "REGISTER_SUCCESS", payload: data });
      toast.success("Tạo tài khoản thành công!");
    } catch (error) {
      const msg = error.response?.data?.message || "Đăng ký thất bại";
  
      dispatch({ type: "REGISTER_FAILURE", payload: msg });
  
      toast.error(msg); // HIỆN POPUP
    }
}


export const getUserProfile=(jwt)=>async(dispatch)=>{
    try {
        const {data}=await axios.get(`${API_BASE_URL}/api/users/profile`,{
            headers:{
                "Authorization":`Bearer ${jwt}`
            }
        })
        dispatch({type:GET_USER_PROFILE_SUCCESS,payload:data})
    } catch (error) {
        console.log("error",error)
        dispatch({type:GET_USER_PROFILE_FAILURE,payload:error.message})
    }
}

export const findUserById=(userId)=>async(dispatch)=>{
    try {
        const {data}=await api.get(`/api/users/${userId}`)
        console.log("find user by id ",data)
        dispatch({type:FIND_USER_BY_ID_SUCCESS,payload:data})
    } catch (error) {
        console.log("error",error)
        dispatch({type:FIND_USER_BY_ID_FAILURE,payload:error.message})
    }
}

export const updateUserProfile=(reqData)=>async(dispatch)=>{
    try {
        const {data}=await api.put(`/api/users/update`,reqData)
        console.log("updated user ",data)
        dispatch({type:UPDATE_USER_SUCCESS,payload:data})
    } catch (error) {
        console.log("error",error)
        dispatch({type:UPDATE_USER_FAILURE,payload:error.message})
    }
}

export const followUserAction=(userId)=>async(dispatch)=>{
    try {
        const {data}=await api.put(`/api/users/${userId}/follow`)
        console.log("followed user ",data)
        dispatch({type:FOLLOW_USER_SUCCESS,payload:data})
    } catch (error) {
        console.log("error",error)
        dispatch({type:FOLLOW_USER_FAILURE,payload:error.message})
    }
}

export const logout=()=>async(dispatch)=>{
  
        localStorage.removeItem("jwt")

        dispatch({type:LOGOUT,payload:null})
    
}