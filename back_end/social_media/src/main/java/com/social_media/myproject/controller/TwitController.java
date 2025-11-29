package com.social_media.myproject.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.social_media.myproject.dto.BookTrendDto;
import com.social_media.myproject.dto.FriendBookTrendDto;
import com.social_media.myproject.dto.TwitDto;
import com.social_media.myproject.dto.mapper.TwitDtoMapper;
import com.social_media.myproject.exception.TwitException;
import com.social_media.myproject.exception.UserException;
import com.social_media.myproject.model.Twit;
import com.social_media.myproject.model.User;
import com.social_media.myproject.request.TwitReplyReques;
import com.social_media.myproject.request.TwitUpdateRequest;
import com.social_media.myproject.response.ApiResponse;
import com.social_media.myproject.service.TwitService;
import com.social_media.myproject.service.UserService;

@RestController
@RequestMapping("/api/twits")
public class TwitController {
	
	@Autowired
	private TwitService twitService;
	
	@Autowired
	private UserService userService;
	
	@PostMapping("/create")
	public ResponseEntity<TwitDto> createTwit(@RequestBody Twit req, 
		@RequestHeader("Authorization") String jwt) throws UserException, TwitException {
		
		User user = userService.findUserProfileByJwt(jwt);
		
		Twit twit = twitService.createTwit(req, user);
		
		TwitDto twitDto = TwitDtoMapper.toTwitDto(twit, user);
		
		return new ResponseEntity<>(twitDto, HttpStatus.CREATED);
		
	}
	
	@PostMapping("/reply")
	public ResponseEntity<TwitDto> replyTwit(@RequestBody TwitReplyReques req, 
		@RequestHeader("Authorization") String jwt) throws UserException, TwitException {
		
		User user = userService.findUserProfileByJwt(jwt);
		
		Twit twit = twitService.createdReply(req, user);
		
		TwitDto twitDto = TwitDtoMapper.toTwitDto(twit, user);
		
		return new ResponseEntity<>(twitDto, HttpStatus.CREATED);
		
	}
	
	@PutMapping("/{twitId}/retwit")
	public ResponseEntity<TwitDto> retwit(@PathVariable Long twitId, 
		@RequestHeader("Authorization") String jwt) throws UserException, TwitException {
		
		User user = userService.findUserProfileByJwt(jwt);
		
		Twit twit = twitService.retwit(twitId, user);
		
		TwitDto twitDto = TwitDtoMapper.toTwitDto(twit, user);
		
		return new ResponseEntity<>(twitDto, HttpStatus.OK);
	}
	
	@GetMapping("/{twitId}")
	public ResponseEntity<TwitDto> findTwitById(@PathVariable Long twitId, 
		@RequestHeader("Authorization") String jwt) throws UserException, TwitException {
		
		User user = userService.findUserProfileByJwt(jwt);
		
		Twit twit = twitService.findById(twitId);
		
		TwitDto twitDto = TwitDtoMapper.toTwitDto(twit, user);
		
		return new ResponseEntity<>(twitDto, HttpStatus.OK);
	}
	
	@DeleteMapping("/{twitId}")
	public ResponseEntity<ApiResponse> deleteTwit(@PathVariable Long twitId, 
		@RequestHeader("Authorization") String jwt) throws UserException, TwitException {
		
		User user = userService.findUserProfileByJwt(jwt);
		
		twitService.deleteTwitById(twitId, user.getId());
		
		ApiResponse res = new ApiResponse();
		res.setMessage("Twit deleted Successfully");
		res.setStatus(true);
		
		return new ResponseEntity<>(res, HttpStatus.OK);
	}

	// Update twit content
	@PutMapping("/{twitId}/edit")
	public ResponseEntity<TwitDto> updateTwit(
			@PathVariable Long twitId,
			@RequestBody TwitUpdateRequest req,
			@RequestHeader("Authorization") String jwt) throws UserException, TwitException {
		User currentUser = userService.findUserProfileByJwt(jwt);
		Twit updated = twitService.updateTwitContent(twitId, req.getContent(), req.getQuoteId(), currentUser);
		TwitDto dto = TwitDtoMapper.toTwitDto(updated, currentUser);
		return new ResponseEntity<>(dto, HttpStatus.OK);
	}
	
	
	@GetMapping("/")
	public ResponseEntity<List<TwitDto>> getAllTwits( 
		@RequestHeader("Authorization") String jwt) throws UserException, TwitException {
		
		User user = userService.findUserProfileByJwt(jwt);
		
		List<Twit> twits = twitService.findAllTwit(user);
		
		List<TwitDto> twitDtos = TwitDtoMapper.toTwitDtos(twits, user);
		
		return new ResponseEntity<>(twitDtos, HttpStatus.OK);
	}

	@GetMapping("/feed")
	public ResponseEntity<List<TwitDto>> getFeedTwits(
			@RequestHeader("Authorization") String jwt) throws UserException, TwitException {
		User user = userService.findUserProfileByJwt(jwt);
		List<Twit> twits = twitService.getFeedTwits(user);
		List<TwitDto> twitDtos = TwitDtoMapper.toTwitDtos(twits, user);
		return new ResponseEntity<>(twitDtos, HttpStatus.OK);
	}

	// Twits mà user đã reply (isReply=true)
	@GetMapping("/user/{userId}/replies")
	public ResponseEntity<List<TwitDto>> getUserReplies(@PathVariable Long userId,
			@RequestHeader("Authorization") String jwt) throws UserException {
		// Chỉ cần xác thực người gọi, dữ liệu dựa trên userId
		userService.findUserProfileByJwt(jwt);
		User targetUser = userService.findUserById(userId);
		List<Twit> replies = twitService.getUserReplies(targetUser);
		List<TwitDto> dtos = TwitDtoMapper.toTwitDtos(replies, targetUser);
		return new ResponseEntity<>(dtos, HttpStatus.OK);
	}
	
	@GetMapping("/user/{userId}")
	public ResponseEntity<List<TwitDto>> getUsersAllTwits(@PathVariable Long userId,
		@RequestHeader("Authorization") String jwt) throws UserException, TwitException {
		
		// Đảm bảo JWT hợp lệ nhưng dùng userId trên path để lấy chủ profile
		userService.findUserProfileByJwt(jwt);
		User targetUser = userService.findUserById(userId);
		
		List<Twit> twits = twitService.getUserTwit(targetUser);
		
		List<TwitDto> twitDtos = TwitDtoMapper.toTwitDtos(twits, targetUser);
		
		return new ResponseEntity<>(twitDtos, HttpStatus.OK);
	}
	
	
	@GetMapping("/user/{userId}/likes")
	public ResponseEntity<List<TwitDto>> findTwitByLikesContainesUser(@PathVariable Long userId,
		@RequestHeader("Authorization") String jwt) throws UserException, TwitException {
		// Xác thực JWT nhưng dữ liệu dựa trên userId của profile đang xem
		userService.findUserProfileByJwt(jwt);
		User targetUser = userService.findUserById(userId);
		
		List<Twit> twits = twitService.findByLikesContainsUser(targetUser);
		
		List<TwitDto> twitDtos = TwitDtoMapper.toTwitDtos(twits, targetUser);
		
		return new ResponseEntity<>(twitDtos, HttpStatus.OK);
	}

	// Trending theo sách toàn cộng đồng
	@GetMapping("/trending/books")
	public ResponseEntity<List<BookTrendDto>> getTrendingBooks(
			@RequestHeader("Authorization") String jwt) throws UserException {
		// chỉ cần user hợp lệ để bảo vệ endpoint, không dùng trong logic hiện tại
		userService.findUserProfileByJwt(jwt);
		List<BookTrendDto> data = twitService.getTrendingBooks();
		return new ResponseEntity<>(data, HttpStatus.OK);
	}

	// Trending theo sách từ hoạt động bạn bè
	@GetMapping("/trending/friends")
	public ResponseEntity<List<FriendBookTrendDto>> getFriendsTrendingBooks(
			@RequestHeader("Authorization") String jwt) throws UserException {
		User user = userService.findUserProfileByJwt(jwt);
		List<FriendBookTrendDto> data = twitService.getFriendsTrendingBooks(user);
		return new ResponseEntity<>(data, HttpStatus.OK);
	}
	
	
	
	

}
