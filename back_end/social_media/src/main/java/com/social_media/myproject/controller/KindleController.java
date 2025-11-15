package com.social_media.myproject.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.social_media.myproject.service.KindleService;

@RestController
@RequestMapping("/api")
public class KindleController {
	
    @Autowired
    private KindleService kindleService;
	
	@PostMapping("/upload-kindle")
	public ResponseEntity<?> uploadKindle(
	        @RequestParam("file") MultipartFile file,
	        @RequestParam("userId") Long userId
	) {
	    kindleService.processHtmlFile(file, userId);
	    return ResponseEntity.ok("Uploaded successfully");
	}

}
