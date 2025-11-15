package com.social_media.myproject.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.social_media.myproject.model.Quote;
import com.social_media.myproject.service.ClippingService;

import java.util.List;

@RestController
@RequestMapping("/api/clippings")
@CrossOrigin(origins = "http://localhost:3000")
public class ClippingController {

    private final ClippingService clippingService;

    public ClippingController(ClippingService clippingService) {
        this.clippingService = clippingService;
    }

    @PostMapping("/upload")
    public ResponseEntity<List<Quote>> uploadFile(@RequestParam("file") MultipartFile file) {
        List<Quote> quotes = clippingService.parseClippings(file);
        return ResponseEntity.ok(quotes);
    }
}