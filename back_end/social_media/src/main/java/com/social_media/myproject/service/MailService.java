package com.social_media.myproject.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.social_media.myproject.model.User;

@Service
public class MailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetLink(User user, String resetLink) {
        if (user == null || user.getEmail() == null) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("QuoteHub - Password reset");
        message.setText("Xin chào " + (user.getFullName() != null ? user.getFullName() : "bạn")
                + "\n\nBạn (hoặc ai đó) vừa yêu cầu đặt lại mật khẩu cho tài khoản QuoteHub của mình. "
                + "Nếu đó là bạn, hãy bấm vào liên kết dưới đây để đặt mật khẩu mới:\n\n"
                + resetLink
                + "\n\nLiên kết này chỉ có hiệu lực trong 30 phút. Nếu bạn không yêu cầu, hãy bỏ qua email này.");

        mailSender.send(message);
    }

    public void sendLoginOtp(User user, String code) {
        if (user == null || user.getEmail() == null) return;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("QuoteHub - Mã xác thực đăng nhập");
        message.setText("Xin chào " + (user.getFullName() != null ? user.getFullName() : "bạn")
                + "\n\nMã xác thực đăng nhập QuoteHub của bạn là: " + code
                + "\nMã này có hiệu lực trong 5 phút. Nếu bạn không thực hiện yêu cầu đăng nhập, hãy bỏ qua email này.");

        mailSender.send(message);
    }
}
