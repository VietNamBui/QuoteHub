package com.social_media.myproject.service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.social_media.myproject.config.JwtProvider;
import com.social_media.myproject.dto.FeaturedUserDto;
import com.social_media.myproject.exception.UserException;
import com.social_media.myproject.model.Twit;
import com.social_media.myproject.model.User;
import com.social_media.myproject.repository.TwitRepository;
import com.social_media.myproject.repository.UserRepository;

@Service
public class UserServiceImplementation implements UserService {
	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private JwtProvider jwtProvider; 
	
	@Autowired
	private NotificationService notificationService;

	@Autowired
	private TwitRepository twitRepository;

	@Override
	public User findUserById(Long userId) throws UserException {
		User user = userRepository.findById(userId)
				.orElseThrow(()->new UserException("user not found with id" + userId));
		return user;
	}

	@Override
	public User findUserProfileByJwt(String jwt) throws UserException {
		String email = jwtProvider.getEmailFromToken(jwt);
		User user = userRepository.findByEmail(email);
		if(user == null) {
			throw new UserException("user not found with email" + email);
		}
		
		return user;
	}

	@Override
	public User updateUser(Long userId, User req) throws UserException {
		User user = findUserById(userId);
		
		if(req.getFullName() != null) {
			user.setFullName(req.getFullName());
		}
		
		if(req.getImage() != null) {
			user.setImage(req.getImage());
		}
		
		if(req.getBackgroundImage() != null) {
			user.setBackgroundImage(req.getBackgroundImage());
		}
		
		return userRepository.save(user);
	}

	@Override
	public User followUser(Long userId, User user) throws UserException {
		User followToUser = findUserById(userId);
		
		if(user.getFollowings().contains(followToUser) && followToUser.getFollowers().contains(user)) {
			user.getFollowings().remove(followToUser);
			followToUser.getFollowers().remove(user);
		} else {
			user.getFollowings().add(followToUser);
			followToUser.getFollowers().add(user);
			// Tạo notification khi user bắt đầu follow người khác
			notificationService.createFollowNotification(user, followToUser);
		}
		
		userRepository.save(followToUser);
		userRepository.save(user);
		
		return followToUser;
	}

	@Override
	public List<User> searchUser(String query) {
		if (query == null || query.trim().isEmpty()) {
			return List.of();
		}
		String q = query.trim().toLowerCase();
		// Lấy tất cả user rồi filter bằng Java cho chắc chắn, tránh phụ thuộc LIKE/collation
		List<User> all = userRepository.findAll();
		return all.stream()
			.filter(u -> {
				String name = u.getFullName() != null ? u.getFullName().toLowerCase() : "";
				String email = u.getEmail() != null ? u.getEmail().toLowerCase() : "";
				return name.contains(q) || email.contains(q);
			})
			.toList();
	}

	@Override
	public List<FeaturedUserDto> getFeaturedUsers() {
		// Lấy tất cả user
		List<User> users = userRepository.findAll();
		if (users.isEmpty()) return List.of();

		// Lấy tất cả twit chính để tính tổng like theo user
		List<Twit> allTwits = twitRepository.findAllByIsTwitTrueOrderByCreatedAtDesc();
		Map<Long, Long> likesByUser = allTwits.stream()
			.filter(t -> t.getUser() != null)
			.collect(Collectors.groupingBy(
				 t -> t.getUser().getId(),
				 Collectors.summingLong(t ->
					 t.getLikes() != null ? (long) t.getLikes().size() : 0L
				 )
			));

		return users.stream()
			.map(u -> {
				long followersCount = u.getFollowers() != null ? u.getFollowers().size() : 0L;
				long totalLikes = likesByUser.getOrDefault(u.getId(), 0L);
				// Bỏ qua user hoàn toàn không có follower và like để danh sách gọn hơn
				if (followersCount == 0 && totalLikes == 0) return null;
				return new FeaturedUserDto(
					u.getId(),
					u.getFullName(),
					u.getEmail(),
					u.getImage(),
					followersCount,
					totalLikes
				);
			})
			.filter(Objects::nonNull)
			.sorted((a, b) -> {
				int cmp = Long.compare(b.getFollowersCount(), a.getFollowersCount());
				if (cmp != 0) return cmp;
				return Long.compare(b.getTotalLikes(), a.getTotalLikes());
			})
			.limit(10)
			.toList();
	}

}
