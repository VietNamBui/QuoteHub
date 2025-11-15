package com.social_media.myproject.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.social_media.myproject.model.Like;

public interface LikeRepository extends JpaRepository<Like, Long>{
	
	@Query("SELECT I FROM Like I WHERE I.user.id=:userId AND I.twit.id=:twitId")
	public Like isLikeExist(@Param("userId") Long userId, @Param("twitId") Long twitld);
	
	@Query("SELECT I FROM Like I WHERE I.twit.id=:twitId")
	public List<Like> findByTwitId(@Param("twitId") Long twitId);
} 
