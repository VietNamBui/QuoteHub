import { api } from "../../config/api"
import { toast } from "react-toastify";
import { 
  FIND_TWEET_BY_ID_FAILURE, 
  FIND_TWEET_BY_ID_SUCCESS, 
  GET_ALL_TWEETS_FAILURE, 
  GET_ALL_TWEETS_REQUEST, 
  GET_ALL_TWEETS_SUCCESS, 
  GET_USERS_TWEET_FAILURE, 
  GET_USERS_TWEET_REQUEST, 
  GET_USERS_TWEET_SUCCESS, 
  LIKE_TWEET_FAILURE, 
  LIKE_TWEET_SUCCESS, 
  REPLY_TWEET_FAILURE, 
  REPLY_TWEET_REQUEST, 
  REPLY_TWEET_SUCCESS, 
  RETWEET_FAILURE, 
  RETWEET_REQUEST, 
  RETWEET_SUCCESS, 
  TWEET_CREATE_FAILURE, 
  TWEET_CREATE_SUCCESS, 
  TWEET_DELETE_FAILURE, 
  TWEET_DELETE_SUCCESS, 
  TWEET_UPDATE_SUCCESS, 
  TWEET_UPDATE_FAILURE, 
  USER_LIKE_TWEET_FAILURE, 
  USER_LIKE_TWEET_SUCCESS, 
  USER_REPLY_TWEET_SUCCESS, 
  USER_REPLY_TWEET_FAILURE 
} from "./ActionType";

export const getAllTweets=()=>async(dispatch)=>{
    try {
        const {data}=await api.get("/api/twits/");
        console.log("get all twits : ",data)
        dispatch({type:GET_ALL_TWEETS_SUCCESS,payload:data})
    } catch (error) {
        console.log("catch error - ",error)
        dispatch({type:GET_ALL_TWEETS_FAILURE,payload:error.message})
    }
}

export const getFeedTweets = () => async (dispatch) => {
    try {
        const { data } = await api.get("/api/twits/feed");
        console.log("get feed twits : ", data);
        dispatch({ type: GET_ALL_TWEETS_SUCCESS, payload: data });
    } catch (error) {
        console.log("catch error - ", error);
        dispatch({ type: GET_ALL_TWEETS_FAILURE, payload: error.message });
    }
};

export const findUserReplies=(userId)=>async(dispatch)=>{
	try{
		const {data}=await api.get(`/api/twits/user/${userId}/replies`);
		console.log("user replies twits : ",data)
		dispatch({type:USER_REPLY_TWEET_SUCCESS,payload:data})
	}catch(error){
		console.log("catch error - ",error)
		dispatch({type:USER_REPLY_TWEET_FAILURE,payload:error.message})
	}
}

export const getUsersTweet=(userId)=>async(dispatch)=>{
    try {
        const {data}=await api.get(`/api/twits/user/${userId}`);
        console.log("get user twits : ",data)
        dispatch({type:GET_USERS_TWEET_SUCCESS,payload:data})
    } catch (error) {
        console.log("catch error - ",error)
        dispatch({type:GET_USERS_TWEET_FAILURE,payload:error.message})
    }
}

export const findTwitsByLikeContaineUser=(userId)=>async(dispatch)=>{
    try {
        const {data}=await api.get(`/api/twits/user/${userId}/likes`);
        console.log("user like twits : ",data)
        dispatch({type:USER_LIKE_TWEET_SUCCESS,payload:data})
    } catch (error) {
        console.log("catch error - ",error)
        dispatch({type:USER_LIKE_TWEET_FAILURE,payload:error.message})
    }
}

export const findTwitsById=(twitId)=>async(dispatch)=>{
    try {
        const {data}=await api.get(`/api/twits/${twitId}`);
        console.log("find twit by id : ",data)
        dispatch({type:FIND_TWEET_BY_ID_SUCCESS,payload:data})
    } catch (error) {
        console.log("catch error - ",error)
        dispatch({type:FIND_TWEET_BY_ID_FAILURE,payload:error.message})
    }
}

export const createTweet=(tweetData)=>async(dispatch)=>{
    try {
        const {data}=await api.post(`/api/twits/create`,tweetData);
        console.log("created tweet: ",data)
        dispatch({type:TWEET_CREATE_SUCCESS,payload:data})
        return data;
    } catch (error) {
        console.log("catch error - ",error)
        const msg = error.response?.data || error.response?.data?.message || "Đăng bài thất bại";
        dispatch({type:TWEET_CREATE_FAILURE,payload:msg})
        // Ném lỗi để component hiển thị popup kết quả AI rõ ràng
        throw new Error(msg);
    }
}

export const createTweetReply=(tweetData)=>async(dispatch)=>{
    try {
        console.log("tweetData in action: ",tweetData)
        const {data}=await api.post(`/api/twits/reply`,tweetData);
        console.log("created reply tweet: ",data)
        dispatch({type:REPLY_TWEET_SUCCESS,payload:data})
    } catch (error) {
        console.log("catch error - ",error)
        const msg = error.response?.data || error.response?.data?.message || "Gửi phản hồi thất bại";
        dispatch({type:REPLY_TWEET_FAILURE,payload:msg})
        toast.error(msg);
    }
}

export const createReTweet=(twitId)=>async(dispatch)=>{
    try {
        const {data}=await api.put(`/api/twits/${twitId}/retwit`);
        console.log("Retweet: ",data)
        dispatch({type:RETWEET_SUCCESS,payload:data})
    } catch (error) {
        console.log("catch error - ",error)
        dispatch({type:RETWEET_FAILURE,payload:error.message})
    }
}

export const likeTweet=(twitId)=>async(dispatch)=>{
    try {
        const {data}=await api.post(`/api/${twitId}/likes`);
        console.log("like tweet : ",data)
        dispatch({type:LIKE_TWEET_SUCCESS,payload:data})
    } catch (error) {
        console.log("catch error - ",error)
        dispatch({type:LIKE_TWEET_FAILURE,payload:error.message})
    }
}

export const updateTweet=(twitId, content, quoteId)=>async(dispatch)=>{
    try{
        const {data}=await api.put(`/api/twits/${twitId}/edit`,{content, quoteId});
        console.log("updated tweet : ",data)
        dispatch({type:TWEET_UPDATE_SUCCESS,payload:data})
    }catch(error){
        console.log("catch error - ",error)
        dispatch({type:TWEET_UPDATE_FAILURE,payload:error.message})
    }
}

export const deleteTweet=(twitId)=>async(dispatch)=>{
    try {
        const {data}=await api.delete(`/api/twits/${twitId}`);
        console.log("deleted tweet : ",data)
        dispatch({type:TWEET_DELETE_SUCCESS,payload:twitId})
    } catch (error) {
        console.log("catch error - ",error)
        dispatch({type:TWEET_DELETE_FAILURE,payload:error.message})
    }
}

// Báo cáo một twit vi phạm
export const reportTweet = (twitId, reason) => async (dispatch) => {
    try {
        await api.post("/api/reports", { twitId, reason });
        toast.success("Đã gửi báo cáo.");
    } catch (error) {
        console.log("catch error - ", error);
        const msg = error.response?.data || error.response?.data?.message || "Không thể gửi báo cáo";
        toast.error(msg);
    }
};