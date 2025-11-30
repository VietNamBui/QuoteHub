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
    private String apiUrl; // Ví dụ: https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent

    @Value("${ai.api.key}")
    private String apiKey; // GOOGLE_API_KEY, nên cấu hình qua biến môi trường

    private final RestTemplate rest = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();

    public List<String> classify(String text) {

        String prompt =
            "Hãy phân loại đoạn trích sau thành nhiều thể loại (labels). " +
            "Chỉ trả về JSON array EX: [\"love\", \"sad\", \"inspiration\"]. " +
            "Không thêm chữ nào khác.\n\n" +
            "Đoạn trích:\n" + text;

        // Request body theo format Google Generative Language API (Gemini)
        Map<String, Object> body = Map.of(
            "contents", List.of(
                Map.of(
                    "parts", List.of(
                        Map.of("text", prompt)
                    )
                )
            ),
            "generationConfig", Map.of(
                "temperature", 0.2
            )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // Google Generative Language API: truyền API key qua header X-goog-api-key
        headers.set("X-goog-api-key", apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = rest.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                Map.class
            );
            // Parse response theo cấu trúc Gemini
            Map<String, Object> bodyMap = response.getBody();
            if (bodyMap == null) return List.of();

            List candidates = (List) bodyMap.get("candidates");
            if (candidates == null || candidates.isEmpty()) return List.of();

            Map<String, Object> firstCandidate = (Map<String, Object>) candidates.get(0);
            Map<String, Object> contentObj = (Map<String, Object>) firstCandidate.get("content");
            if (contentObj == null) return List.of();

            List parts = (List) contentObj.get("parts");
            if (parts == null || parts.isEmpty()) return List.of();

            Map<String, Object> firstPart = (Map<String, Object>) parts.get(0);
            String content = (String) firstPart.get("text");

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
