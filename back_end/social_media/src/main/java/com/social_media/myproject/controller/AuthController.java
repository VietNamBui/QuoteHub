package com.social_media.myproject.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.social_media.myproject.config.JwtProvider;
import com.social_media.myproject.exception.UserException;
import com.social_media.myproject.model.PasswordResetToken;
import com.social_media.myproject.model.TwoFactorCode;
import com.social_media.myproject.model.User;
import com.social_media.myproject.model.Varification;
import com.social_media.myproject.repository.PasswordResetTokenRepository;
import com.social_media.myproject.repository.TwoFactorCodeRepository;
import com.social_media.myproject.repository.UserRepository;
import com.social_media.myproject.response.AuthResponse;
import com.social_media.myproject.service.CustomUserDetailsServiceImplementation;
import com.social_media.myproject.service.MailService;

@RestController
@RequestMapping("/auth")
public class AuthController {
	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private PasswordEncoder  passwordEncoder;
	
	@Autowired
	private JwtProvider jwtProvider;
	
	@Autowired
	private CustomUserDetailsServiceImplementation customUserDetails;
	
	@Autowired
	private PasswordResetTokenRepository passwordResetTokenRepository;
	
	@Autowired
	private MailService mailService;
	
	@Autowired
	private TwoFactorCodeRepository twoFactorCodeRepository;
	
	@PostMapping("/signup")
	public ResponseEntity<AuthResponse> createUserHandler(@RequestBody User user) throws UserException {
		
		String email = user.getEmail();
		String password = user.getPassword();
		String fullName = user.getFullName();
		String birthDate = user.getBirthDate();
		
		
		User isEmailExist = userRepository.findByEmail(email);
		
		if(isEmailExist != null) {
			throw new UserException("Email is already used with another account");
		}
		
		User createdUser = new User();
		createdUser.setEmail(email);
		createdUser.setFullName(fullName);
		createdUser.setPassword(passwordEncoder.encode(password));
		createdUser.setBirthDate(birthDate);
		createdUser.setVerification(new Varification());
		
		User savedUser = userRepository.save(createdUser);
		
		Authentication authentication = new UsernamePasswordAuthenticationToken(email, password);
		SecurityContextHolder.getContext().setAuthentication(authentication);
		
		String token = jwtProvider.generateToken(authentication);
		
		AuthResponse res = new AuthResponse(token, true);
		
		return new ResponseEntity<AuthResponse>(res, HttpStatus.CREATED);
	}
	
	@PostMapping("/verify-otp")
	public ResponseEntity<AuthResponse> verifyOtp(@RequestBody VerifyOtpRequest req) {
		if (req.email == null || req.email.isBlank() || req.code == null || req.code.isBlank()) {
			return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
		}
		User user = userRepository.findByEmail(req.email);
		if (user == null) {
			throw new BadCredentialsException("invalid username or password");
		}
		
		TwoFactorCode code = twoFactorCodeRepository
			.findFirstByUserAndCodeAndUsedFalseAndExpiresAtAfter(user, req.code, LocalDateTime.now())
			.orElse(null);
		if (code == null) {
			throw new BadCredentialsException("invalid otp code");
		}
		
		code.setUsed(true);
		twoFactorCodeRepository.save(code);
		
		// OTP hợp lệ -> tạo Authentication từ UserDetails và cấp JWT
		UserDetails userDetails = customUserDetails.loadUserByUsername(user.getEmail());
		Authentication authentication = new UsernamePasswordAuthenticationToken(
			userDetails,
			null,
			userDetails.getAuthorities());
		String token = jwtProvider.generateToken(authentication);
		AuthResponse res = new AuthResponse(token, true);
		return new ResponseEntity<>(res, HttpStatus.OK);
	}
	
	@PostMapping("/signin")
	public ResponseEntity<?> signin(@RequestBody User user) {
		String username = user.getEmail();
		String password = user.getPassword();
		
		// Bước 1: xác thực email + password
		Authentication authentication = authenticate(username, password);
		
		// Bước 2: tìm user và tạo mã OTP 6 số, hiệu lực 5 phút
		User dbUser = userRepository.findByEmail(username);
		if (dbUser == null) {
			throw new BadCredentialsException("invalid username or password");
		}
		
		String code = String.format("%06d", new Random().nextInt(999999));
		
		TwoFactorCode twoFactor = new TwoFactorCode();
		twoFactor.setUser(dbUser);
		twoFactor.setCode(code);
		twoFactor.setExpiresAt(LocalDateTime.now().plusMinutes(5));
		twoFactor.setUsed(false);
		twoFactorCodeRepository.save(twoFactor);
		
		// Gửi mã OTP qua email
		mailService.sendLoginOtp(dbUser, code);
		
		// Trả về phản hồi cho FE biết cần nhập OTP
		Map<String, Object> res = new HashMap<>();
		res.put("twoFactorRequired", true);
		res.put("email", username);
		return new ResponseEntity<>(res, HttpStatus.ACCEPTED);
	}
	
	@PostMapping("/forgot-password")
	public ResponseEntity<String> forgotPassword(@RequestBody User req) {
		String email = req.getEmail();
		if (email == null || email.isBlank()) {
			return new ResponseEntity<>("Email is required", HttpStatus.BAD_REQUEST);
		}
		User user = userRepository.findByEmail(email);
		// Luôn trả về 200 để tránh lộ thông tin tài khoản tồn tại hay không
		if (user == null) {
			return new ResponseEntity<>("If this email exists, a reset link has been sent", HttpStatus.OK);
		}
		// Tạo token mới
		PasswordResetToken token = new PasswordResetToken();
		token.setUser(user);
		token.setToken(UUID.randomUUID().toString());
		token.setExpiresAt(LocalDateTime.now().plusMinutes(30));
		token.setUsed(false);
		passwordResetTokenRepository.save(token);
		
		String resetLink = "http://localhost:3000/reset-password?token=" + token.getToken();
		mailService.sendPasswordResetLink(user, resetLink);
		
		return new ResponseEntity<>("If this email exists, a reset link has been sent", HttpStatus.OK);
	}
	
	@PostMapping("/reset-password")
	public ResponseEntity<String> resetPassword(@RequestBody PasswordResetRequest req) {
		if (req.token == null || req.token.isBlank() || req.newPassword == null || req.newPassword.isBlank()) {
			return new ResponseEntity<>("Token and new password are required", HttpStatus.BAD_REQUEST);
		}
		PasswordResetToken token = passwordResetTokenRepository.findByToken(req.token).orElse(null);
		if (token == null || token.isUsed() || token.getExpiresAt() == null || token.getExpiresAt().isBefore(LocalDateTime.now())) {
			return new ResponseEntity<>("Invalid or expired token", HttpStatus.BAD_REQUEST);
		}
		User user = token.getUser();
		if (user == null) {
			return new ResponseEntity<>("Invalid token", HttpStatus.BAD_REQUEST);
		}
		user.setPassword(passwordEncoder.encode(req.newPassword));
		userRepository.save(user);
		token.setUsed(true);
		passwordResetTokenRepository.save(token);
		return new ResponseEntity<>("Password has been reset", HttpStatus.OK);
	}

	private Authentication authenticate(String username, String password) {
		UserDetails userDetails = customUserDetails.loadUserByUsername(username);
		
		if(userDetails == null) {
			throw new BadCredentialsException("Invalid username...");
		}
		
		if(!passwordEncoder.matches(password, userDetails.getPassword())) {
			throw new BadCredentialsException("invalid username or password");
		}
		return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
	}
	
	// DTO đơn giản cho reset password
	public static class PasswordResetRequest {
		public String token;
		public String newPassword;
	}
	
	// DTO cho verify OTP
	public static class VerifyOtpRequest {
		public String email;
		public String code;
		public String password; // optional nếu muốn xác thực lại
	}
	
	
	
	
	
	
	
}
