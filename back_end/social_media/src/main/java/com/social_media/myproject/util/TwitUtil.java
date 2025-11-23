package com.social_media.myproject.util;

import com.social_media.myproject.model.Like;
import com.social_media.myproject.model.Twit;
import com.social_media.myproject.model.TwitRetwitUser;
import com.social_media.myproject.model.User;

public class TwitUtil {
	
	public final static boolean isLikedByReqUser(User reqUser, Twit twit) {
		
		for(Like like : twit.getLikes()) {
			if(like.getUser().getId().equals(reqUser.getId())) {
				return true;
			}
		}
		return false;
	}
	
//	public final static boolean isRetwitedByReqUser(User reqUser, Twit twit) {
//		for(User user : twit.getRetwits()) {
//			if(user.getId().equals(reqUser.getId())) {
//				return true;
//			}
//		}
//		return false;
//	}
	public final static boolean isRetwitedByReqUser(User reqUser, Twit twit) {
	    for (TwitRetwitUser r : twit.getRetwits()) {
	        if (r.getUser().getId().equals(reqUser.getId())) {
	            return true;
	        }
	    }
	    return false;
	}
	
}
