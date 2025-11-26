package com.social_media.myproject.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.social_media.myproject.config.JwtProvider;
import com.social_media.myproject.exception.UserException;
import com.social_media.myproject.model.User;
import com.social_media.myproject.repository.UserRepository;

@Service
public class UserServiceImplementation implements UserService {
	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private JwtProvider jwtProvider; 

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
		
		if(req.getBirthDate() != null) {
			user.setBirthDate(req.getBirthDate());
		}
		
		if(req.getLocation() != null) {
			user.setLocation(req.getLocation());
		}
		
		if (req.getBio() != null) {
			user.setBio(req.getBio());
		}
		
		if(req.getWebsite() != null) {
			user.setWebsite(req.getWebsite());
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

}
