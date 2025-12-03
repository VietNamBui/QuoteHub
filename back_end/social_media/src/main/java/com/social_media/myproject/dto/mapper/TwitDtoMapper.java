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
import com.social_media.myproject.model.Quote;
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
		twitDto.setTotalReplies(countAllReplies(twit));
		twitDto.setTotalRetweets(twit.getRetwits().size());
		twitDto.setUser(user);
		twitDto.setLiked(isLiked);
		twitDto.setRetwit(isRetwited);
		twitDto.setRetwitUserId(retwitUserId);
		twitDto.setReply(Boolean.TRUE.equals(twit.getIsReply()));
		// Map trạng thái kiểm duyệt để feed/reply giữ được thông tin sau reload
		twitDto.setModerationStatus(twit.getModerationStatus());
		twitDto.setModerationReason(twit.getModerationReason());
		// Map trạng thái kiểm duyệt để feed/reply giữ được thông tin sau reload
		twitDto.setModerationStatus(twit.getModerationStatus());
		twitDto.setModerationReason(twit.getModerationReason());
		// Chỉ map các reply đã được APPROVED (hoặc chưa có trạng thái) để ẩn PENDING/BLOCKED
		java.util.List<Twit> visibleReplies;
		if (twit.getReplyTwits() == null || twit.getReplyTwits().isEmpty()) {
			visibleReplies = java.util.List.of();
		} else {
			visibleReplies = twit.getReplyTwits().stream()
				.filter(r -> {
					String s = r.getModerationStatus();
					return s == null || "APPROVED".equals(s);
				})
				.toList();
		}
		twitDto.setReplyTwits(toTwitDtos(visibleReplies, reqUser, visitedIds));
		// Map trạng thái kiểm duyệt
		twitDto.setModerationStatus(twit.getModerationStatus());
		twitDto.setModerationReason(twit.getModerationReason());
		
		// Luôn dùng snapshot cho nội dung quote hiển thị
		if (twit.getQuoteSnapshot() != null) {
			twitDto.setQuoteHighlight(twit.getQuoteSnapshot());
		}
		Quote quote = twit.getQuote();
		if (quote != null) {
			twitDto.setQuoteId(quote.getId());
			if (quote.getBook() != null) {
				twitDto.setQuoteBookTitle(quote.getBook().getTitle());
				twitDto.setQuoteBookAuthor(quote.getBook().getAuthor());
				twitDto.setQuoteBookId(quote.getBook().getId());
			}
		}
		// Nếu đây là reply, map thêm thông tin bài gốc
		if (twit.getReplyFor() != null) {
			Twit parent = twit.getReplyFor();
			twitDto.setParentId(parent.getId());
			twitDto.setParentContent(parent.getContent());
			if (parent.getUser() != null) {
				UserDto parentUser = UserDtoMapper.toUserDto(parent.getUser());
				twitDto.setParentUser(parentUser);
			}
			// dùng snapshot của bài gốc cho nội dung quote
			if (parent.getQuoteSnapshot() != null) {
				twitDto.setParentQuoteHighlight(parent.getQuoteSnapshot());
			}
			Quote pQuote = parent.getQuote();
			if (pQuote != null && pQuote.getBook() != null) {
				twitDto.setParentQuoteBookTitle(pQuote.getBook().getTitle());
				twitDto.setParentQuoteBookAuthor(pQuote.getBook().getAuthor());
			}
		}
			
		return twitDto;
	}

	private static int countAllReplies(Twit twit) {
		return countAllRepliesInternal(twit, new HashSet<>());
	}

	private static int countAllRepliesInternal(Twit twit, Set<Long> visitedIds) {
		if (twit == null || twit.getReplyTwits() == null) return 0;
		if (visitedIds.contains(twit.getId())) return 0;
		visitedIds.add(twit.getId());
		int total = 0;
		for (Twit reply : twit.getReplyTwits()) {
			String s = reply.getModerationStatus();
			// Chỉ đếm các reply đã được APPROVED (hoặc chưa có trạng thái)
			if (s == null || "APPROVED".equals(s)) {
				total += 1;
				total += countAllRepliesInternal(reply, visitedIds);
			}
		}
		return total;
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
		// DEBUG: log moderation info JPA đọc được từ DB
		System.out.println("[TwitDtoMapper] toReplyTwitDto twitId=" + twit.getId()
			+ " status=" + twit.getModerationStatus()
			+ " reason=" + twit.getModerationReason());

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
		twitDto.setTotalReplies(countAllReplies(twit));
		twitDto.setTotalRetweets(twit.getRetwits().size());
		twitDto.setUser(user);
		twitDto.setLiked(isLiked);
		twitDto.setRetwit(isRetwited);
		twitDto.setRetwitUserId(retwitUserId);
		
		Quote quote = twit.getQuote();
		if (quote != null) {
			twitDto.setQuoteHighlight(quote.getHighlight());
			if (quote.getBook() != null) {
				twitDto.setQuoteBookTitle(quote.getBook().getTitle());
				twitDto.setQuoteBookAuthor(quote.getBook().getAuthor());
			}
		}
		// Map thêm bài gốc nếu có
		if (twit.getReplyFor() != null) {
			Twit parent = twit.getReplyFor();
			twitDto.setParentId(parent.getId());
			twitDto.setParentContent(parent.getContent());
			if (parent.getUser() != null) {
				UserDto parentUser = UserDtoMapper.toUserDto(parent.getUser());
				twitDto.setParentUser(parentUser);
			}
			Quote pQuote = parent.getQuote();
			if (pQuote != null) {
				twitDto.setParentQuoteHighlight(pQuote.getHighlight());
				if (pQuote.getBook() != null) {
					twitDto.setParentQuoteBookTitle(pQuote.getBook().getTitle());
					twitDto.setParentQuoteBookAuthor(pQuote.getBook().getAuthor());
				}
			}
		}
		
	    // đệ quy qua replyTwits nhưng chỉ lấy các reply đã APPROVED (hoặc chưa có trạng thái)
	    List<TwitDto> replyDtos = new ArrayList<>();
	    if (twit.getReplyTwits() != null) {
	    	for (Twit reply : twit.getReplyTwits()) {
	    		String s = reply.getModerationStatus();
	    		if (s != null && !"APPROVED".equals(s)) continue;
	    		TwitDto dto = toTwitDto(reply, reqUser, visitedIds);
	    		if (dto != null) replyDtos.add(dto);
	    	}
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
