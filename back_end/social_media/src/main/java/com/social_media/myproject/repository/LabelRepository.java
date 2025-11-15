package com.social_media.myproject.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.social_media.myproject.model.Label;

public interface LabelRepository extends JpaRepository<Label, Long> {
	
	Optional<Label> findByName(String name);
	
}