package com.social_media.myproject.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.social_media.myproject.model.Label;
import com.social_media.myproject.repository.LabelRepository;

@RestController
@RequestMapping("/api/labels")
public class LabelController {

    @Autowired
    private LabelRepository labelRepository;

    @GetMapping
    public List<Label> getAll() {
        return labelRepository.findAll();
    }

    @PostMapping
    public Label create(@RequestBody Label label) {
        return labelRepository.save(label);
    }
}