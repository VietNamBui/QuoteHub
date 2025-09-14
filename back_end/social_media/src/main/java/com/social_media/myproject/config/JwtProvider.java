package com.social_media.myproject.config;

import javax.crypto.SecretKey;

import io.jsonwebtoken.security.Keys;

public class JwtProvider {
	
	SecretKey key = Keys.hmacShaKeyFor(JwtConstant.SECRET_KEY.getBytes());
	

}
