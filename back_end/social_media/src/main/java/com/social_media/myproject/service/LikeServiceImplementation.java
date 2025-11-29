package com.social_media.myproject.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.social_media.myproject.exception.TwitException;
import com.social_media.myproject.exception.UserException;
import com.social_media.myproject.model.Like;
import com.social_media.myproject.model.Twit;
import com.social_media.myproject.model.User;
import com.social_media.myproject.repository.LikeRepository;
import com.social_media.myproject.repository.TwitRepository;

@Service
public class LikeServiceImplementation implements LikeService{
	
	@Autowired
	private LikeRepository likeRepository;
	
	@Autowired
	private TwitService twitService;
	
	@Autowired
	private TwitRepository twitRepository;

	@Autowired
	private NotificationService notificationService;
	
	@Override
	public Like likeTwit(Long twitId, User user) throws UserException, TwitException {
		Like isLikeExist = likeRepository.isLikeExist(user.getId(), twitId);
		
		if(isLikeExist != null) {
			likeRepository.deleteById(isLikeExist.getId());
			return isLikeExist;
		}
		
		Twit twit = twitService.findById(twitId);
		
		Like like = new Like();
		like.setTwit(twit);
		like.setUser(user);
		
		Like savedLike = likeRepository.save(like);
		
		twit.getLikes().add(savedLike);
		twitRepository.save(twit);
		
		// Tạo notification cho chủ twit khi có người khác like
		if (twit.getUser() != null) {
			notificationService.createLikeNotification(user, twit.getUser(), twit);
		}
		
		return savedLike;
	}

	@Override
	public List<Like> getAllLikes(Long twitId) throws TwitException {
		
		Twit twit = twitService.findById(twitId);
		
		List<Like> likes = likeRepository.findByTwitId(twitId);
		
		return likes;
	}

}
