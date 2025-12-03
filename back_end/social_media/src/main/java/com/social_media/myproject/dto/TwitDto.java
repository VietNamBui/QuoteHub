package com.social_media.myproject.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class TwitDto {
	
	private Long id;
	
	private String content;
	
	private String image;
	
	private UserDto user;
	
	private LocalDateTime createdAt;
	
	private int totalLikes;
	
	private int totalReplies;
	
	private int totalRetweets;
	
	private boolean isLiked;
	
	private boolean isRetwit;
	
	// true nếu đây là bình luận (reply), false nếu là bài chính
	private boolean reply;
	
	private List<Long>retwitUserId;
	
	private List<TwitDto> replyTwits;

	// Thông tin câu quote gắn với twit (nếu có)
	private String quoteHighlight;
	private String quoteBookTitle;
	private String quoteBookAuthor;
	private Long quoteId;
	private Long quoteBookId;
	
	// Thông tin bài gốc nếu đây là reply
	private Long parentId;
	private String parentContent;
	private UserDto parentUser;
	private String parentQuoteHighlight;
	private String parentQuoteBookTitle;
	private String parentQuoteBookAuthor;
	
	// Trạng thái kiểm duyệt nội dung
	private String moderationStatus;
	private String moderationReason;

}
