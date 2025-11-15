package com.social_media.myproject.service;

import java.nio.charset.StandardCharsets;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.social_media.myproject.model.Book;
import com.social_media.myproject.model.Quote;
import com.social_media.myproject.model.User;
import com.social_media.myproject.repository.BookRepository;
import com.social_media.myproject.repository.QuoteRepository;
import com.social_media.myproject.repository.UserRepository;

@Service
public class KindleService {

    @Autowired
    private BookRepository bookRepo;

    @Autowired
    private QuoteRepository quoteRepo;

    @Autowired
    private UserRepository userRepo;

    public void processHtmlFile(MultipartFile file, Long userId) {
        try {
            String html = new String(file.getBytes(), StandardCharsets.UTF_8);
            Document doc = Jsoup.parse(html);

            // 1. Lấy thông tin sách
            String title = doc.select("div.bookTitle").text();
            String authors = doc.select("div.authors").text();

            // 2. Kiểm tra sách tồn tại?
            Book book = bookRepo.findByTitleAndAuthor(title, authors)
                    .orElseGet(() -> {
                        Book b = new Book();
                        b.setTitle(title);
                        b.setAuthor(authors);
                        return bookRepo.save(b);
                    });

            User user = userRepo.findById(userId).orElseThrow();

            // 3. Lấy danh sách highlight
            Elements headings = doc.select("div.noteHeading");

            for (Element h : headings) {
                String headingText = h.text();

                // Loại Note (không phải highlight)
                if (!headingText.startsWith("Highlight")) continue;

                // Extract màu highlight
                String color = h.select("span").text(); // yellow, blue,...

                // Extract position
                // Example: "Highlight (yellow) - Location 208"
                String[] parts = headingText.split("-");
                String positionPart = parts[1].trim(); // "Location 208"

                String[] posParts = positionPart.split(" ");
                String positionType = posParts[0].toLowerCase(); // location
                int positionValue = Integer.parseInt(posParts[1]);

                // Lấy nội dung quote trong noteText kế tiếp
                Element noteText = h.nextElementSibling();
                String quoteContent = noteText.text();
                
                // Kiểm tra nếu highlight này đã tồn tại cho Book, positionType, positionValue
                boolean exists = quoteRepo.existsByHighlightAndBookAndPositionTypeAndPositionValueAndUser(
                        quoteContent, book, positionType, positionValue, user);

                if (exists) {
                    // Nếu đã tồn tại, bỏ qua
                    continue;
                }

                // 4. Save Quote
                Quote q = new Quote();
                q.setHighlight(quoteContent);
                q.setBook(book);
                q.setUser(user);
                q.setPositionType(positionType);
                q.setPositionValue(positionValue);

                quoteRepo.save(q);
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}

