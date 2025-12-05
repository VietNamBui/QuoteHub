package com.social_media.myproject.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.social_media.myproject.dto.UserDto;
import com.social_media.myproject.dto.mapper.UserDtoMapper;
import com.social_media.myproject.exception.UserException;
import com.social_media.myproject.model.User;
import com.social_media.myproject.repository.UserRepository;
import com.social_media.myproject.service.UserService;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserDto>> getAllUsers(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "query", required = false) String query) throws UserException {
        User current = userService.findUserProfileByJwt(jwt);
        if (!current.isAdmin()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        List<User> users;
        if (query != null && !query.trim().isEmpty()) {
            users = userRepository.searchUser(query.trim());
        } else {
            users = userRepository.findAll();
        }

        List<UserDto> dtos = users.stream()
                .map(UserDtoMapper::toUserDto)
                .collect(Collectors.toList());
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    public static class UpdateAdminRequest {
        public Boolean admin;
    }

    @PutMapping("/{id}/admin")
    public ResponseEntity<UserDto> updateUserAdminFlag(
            @PathVariable("id") Long id,
            @RequestHeader("Authorization") String jwt,
            @RequestBody UpdateAdminRequest req) throws UserException {
        User current = userService.findUserProfileByJwt(jwt);
        if (!current.isAdmin()) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        if (req == null || req.admin == null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        User target = userService.findUserById(id);

        // Không cho tự hạ quyền chính mình
        if (current.getId().equals(target.getId()) && !req.admin) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        // Nếu đang tắt admin của một admin, cần đảm bảo vẫn còn ít nhất 1 admin
        if (target.isAdmin() && !req.admin) {
            long adminCount = userRepository.countByAdminTrue();
            if (adminCount <= 1) {
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        }

        target.setAdmin(req.admin);
        User saved = userRepository.save(target);
        UserDto dto = UserDtoMapper.toUserDto(saved);
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }
}
