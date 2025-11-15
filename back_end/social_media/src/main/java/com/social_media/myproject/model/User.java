package com.social_media.myproject.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.JoinColumn;
import lombok.Data;


@Entity
@Data
public class User {
	
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private Long id;
	
	private String fullName;
	private String location;
	private String website;
	private String birthDate;
	private String email;
	private String password;
	private String mobile;
	private String image;
	private String backgroundImage;
	private String bio;
	private boolean req_user;
	private boolean login_with_google;
	
	 // Twits
	@JsonIgnore
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<Twit> twits = new ArrayList<>();
	
	 // Likes
	@OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
	private List<Like> likes = new ArrayList<>();
	
	@Embedded
	private Varification verification;
	
    // Followers
    @ManyToMany(mappedBy = "followings")
    private Set<User> followers;
	
    // Following
    @ManyToMany
    @JoinTable(
        name = "user_followings",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "following_id")
    )
    private Set<User> followings;
    
    // Retwits
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<TwitRetwitUser> retwits = new ArrayList<>();
	
	
}
