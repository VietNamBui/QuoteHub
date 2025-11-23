package com.social_media.myproject.dto.mapper;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.social_media.myproject.dto.TwitDto;
import com.social_media.myproject.dto.UserDto;
import com.social_media.myproject.model.Twit;
import com.social_media.myproject.model.TwitRetwitUser;
import com.social_media.myproject.model.User;
import com.social_media.myproject.util.TwitUtil;

public class TwitDtoMapper {
	public static TwitDto toTwitDto(Twit twit, User reqUser, Set<Long> visitedIds) {
	    if (visitedIds.contains(twit.getId())) return null;
	    visitedIds.add(twit.getId());
		
		UserDto user = UserDtoMapper.toUserDto(twit.getUser());
		
		boolean isLiked = TwitUtil.isLikedByReqUser(reqUser, twit);
		boolean isRetwited = TwitUtil.isRetwitedByReqUser(reqUser, twit);
		
		List<Long> retwitUserId = new ArrayList<>();
		
		for(TwitRetwitUser r : twit.getRetwits()) {
		    retwitUserId.add(r.getUser().getId());
		}
		
		TwitDto twitDto = new TwitDto();
		twitDto.setId(twit.getId());
		twitDto.setContent(twit.getContent());
		twitDto.setCreatedAt(twit.getCreatedAt());
		twitDto.setImage(twit.getImage());
		twitDto.setTotalLikes(twit.getLikes().size());
		twitDto.setTotalReplies(twit.getReplyTwits().size());
		twitDto.setTotalRetweets(twit.getRetwits().size());
		twitDto.setUser(user);
		twitDto.setLiked(isLiked);
		twitDto.setRetwit(isRetwited);
		twitDto.setRetwitUserId(retwitUserId);
		twitDto.setReplyTwits(toTwitDtos(twit.getReplyTwits(), reqUser, visitedIds));
		twitDto.setVideo(twit.getVideo());
			
		return twitDto;
	}
	
	public static List<TwitDto> toTwitDtos(List<Twit> twits, User reqUser) {
		Set<Long> visitedIds = new HashSet<>();
		List<TwitDto> twitDtos = new ArrayList<>();
		
	    for (Twit twit : twits) {
	        TwitDto dto = toReplyTwitDto(twit, reqUser, visitedIds);
	        if (dto != null) twitDtos.add(dto);
	    }
		return twitDtos;
		
	}

	private static TwitDto toReplyTwitDto(Twit twit, User reqUser, Set<Long> visitedIds) {
	    if (twit == null) return null;
	    if (visitedIds.contains(twit.getId())) return null;
	    visitedIds.add(twit.getId());
		
		UserDto user = UserDtoMapper.toUserDto(twit.getUser());
		
		boolean isLiked = TwitUtil.isLikedByReqUser(reqUser, twit);
		boolean isRetwited = TwitUtil.isRetwitedByReqUser(reqUser, twit);
		
		List<Long> retwitUserId = new ArrayList<>();
		
		for(TwitRetwitUser r : twit.getRetwits()) {
		    retwitUserId.add(r.getUser().getId());
		}
		
		TwitDto twitDto = new TwitDto();
		twitDto.setId(twit.getId());
		twitDto.setContent(twit.getContent());
		twitDto.setCreatedAt(twit.getCreatedAt());
		twitDto.setImage(twit.getImage());
		twitDto.setTotalLikes(twit.getLikes().size());
		twitDto.setTotalReplies(twit.getReplyTwits().size());
		twitDto.setTotalRetweets(twit.getRetwits().size());
		twitDto.setUser(user);
		twitDto.setLiked(isLiked);
		twitDto.setRetwit(isRetwited);
		twitDto.setRetwitUserId(retwitUserId);
		twitDto.setVideo(twit.getVideo());
		
	    // đệ quy qua replyTwits
	    List<TwitDto> replyDtos = new ArrayList<>();
	    for (Twit reply : twit.getReplyTwits()) {
	        TwitDto dto = toTwitDto(reply, reqUser, visitedIds);
	        if (dto != null) replyDtos.add(dto);
	    }
	    twitDto.setReplyTwits(replyDtos);
		
		
		return twitDto;
	}
	
	// overload mới nhận 3 tham số (dùng cho đệ quy)
	public static List<TwitDto> toTwitDtos(List<Twit> twits, User reqUser, Set<Long> visitedIds) {
	    List<TwitDto> twitDtos = new ArrayList<>();
	    for (Twit twit : twits) {
	        TwitDto dto = toReplyTwitDto(twit, reqUser, visitedIds);
	        if (dto != null) twitDtos.add(dto);
	    }
	    return twitDtos;
	}
	
	public static TwitDto toTwitDto(Twit twit, User reqUser) {
	    return toTwitDto(twit, reqUser, new HashSet<>());
	}
	
	
}
