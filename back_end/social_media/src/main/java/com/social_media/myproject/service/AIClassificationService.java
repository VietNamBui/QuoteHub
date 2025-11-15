package com.social_media.myproject.service;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class AIClassificationService {

    @Value("${ai.api.url}")
    private String apiUrl;

    @Value("${ai.api.key}")
    private String apiKey;

    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public List<String> classify(String text) {

        String prompt =
            "Hãy phân loại đoạn trích sau thành nhiều thể loại (labels). " +
            "Chỉ trả về JSON array EX: [\"love\", \"sad\", \"inspiration\"]. " +
            "Không thêm chữ nào khác.\n\n" +
            "Đoạn trích:\n" + text;

        Map<String, Object> body = Map.of(
            "model", "deepseek/deepseek-chat-v3.1:free",
            "messages", List.of(
                Map.of("role", "user", "content", prompt)
            ),
            "temperature", 0.2
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        // OpenRouter yêu cầu
        headers.set("HTTP-Referer", "http://localhost:3000");
        headers.set("X-Title", "Social Media Quote App");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = rest.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                Map.class
            );

            Map<String, Object> choice = (Map<String, Object>)
                ((List) response.getBody().get("choices")).get(0);

            String content = (String)
                ((Map) choice.get("message")).get("content");

            // Xử lý trường hợp trả về dạng ```json ... ```
            content = content
                .replace("```json", "")
                .replace("```", "")
                .trim();

            return mapper.readValue(content, new TypeReference<List<String>>() {});

        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }
}
