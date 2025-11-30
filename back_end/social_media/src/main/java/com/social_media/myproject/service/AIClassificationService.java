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

    public static class ModerationResult {
        public boolean safe;
        public double riskScore;
        public List<String> categories;
    }

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

    /**
     * Gọi Gemini để lấy kết quả kiểm duyệt dạng có cấu trúc. Không ném lỗi nghiệp vụ,
     * chỉ log khi lỗi kỹ thuật và trả về kết quả "an toàn" mặc định.
     */
    public ModerationResult moderate(String text) {
        ModerationResult res = new ModerationResult();
        res.safe = true;
        res.riskScore = 0.0;
        res.categories = List.of();
        if (text == null) return res;
        String trimmed = text.trim();
        if (trimmed.isEmpty()) return res;

        String prompt =
            "You are a content moderation system for a social media app. Given the user text, " +
            "decide if it violates any of these policies: hate speech or harassment, explicit " +
            "sexual content, graphic violence, encouragement of self-harm, or illegal activities. " +
            "Respond ONLY with strict JSON in this schema and nothing else:\n" +
            "{" +
            "  \"is_safe\": true|false," +
            "  \"risk_score\": number between 0 and 1," +
            "  \"categories\": [\"HATE\", \"SEXUAL\", \"VIOLENCE\", \"SELF_HARM\", \"ILLEGAL\"]" +
            "}\n" +
            "User text:\n" + trimmed;

        Map<String, Object> body = Map.of(
            "contents", List.of(
                Map.of(
                    "parts", List.of(
                        Map.of("text", prompt)
                    )
                )
            ),
            "generationConfig", Map.of(
                "temperature", 0.1
            )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-goog-api-key", apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = rest.exchange(
                apiUrl,
                HttpMethod.POST,
                entity,
                Map.class
            );

            Map<String, Object> bodyMap = response.getBody();
            if (bodyMap == null) return res;

            List candidates = (List) bodyMap.get("candidates");
            if (candidates == null || candidates.isEmpty()) return res;

            Map<String, Object> firstCandidate = (Map<String, Object>) candidates.get(0);
            Map<String, Object> contentObj = (Map<String, Object>) firstCandidate.get("content");
            if (contentObj == null) return res;

            List parts = (List) contentObj.get("parts");
            if (parts == null || parts.isEmpty()) return res;

            Map<String, Object> firstPart = (Map<String, Object>) parts.get(0);
            String content = (String) firstPart.get("text");

            if (content == null || content.isBlank()) return res;

            content = content
                .replace("```json", "")
                .replace("```", "")
                .trim();

            Map<String, Object> result = mapper.readValue(
                content,
                new TypeReference<Map<String, Object>>() {}
            );

            Object safeObj = result.get("is_safe");
            res.safe = safeObj instanceof Boolean ? (Boolean) safeObj : true;
            Object scoreObj = result.get("risk_score");
            if (scoreObj instanceof Number) {
                res.riskScore = ((Number) scoreObj).doubleValue();
            }
            @SuppressWarnings("unchecked")
            List<String> categories = (List<String>) result.get("categories");
            res.categories = categories != null ? categories : List.of();
        } catch (Exception e) {
            // Nếu AI lỗi, coi như an toàn nhưng log lại để theo dõi.
            e.printStackTrace();
        }
        return res;
    }

    /**
     * Hàm tiện ích cho các luồng muốn chặn luôn nội dung vi phạm nặng.
     */
    public void assertContentSafeOrThrow(String text) {
        ModerationResult res = moderate(text);
        if (res.safe) return;
        String reason = (res.categories == null || res.categories.isEmpty())
            ? "Nội dung không phù hợp theo chính sách cộng đồng."
            : "Nội dung không phù hợp: " + String.join(", ", res.categories);
        throw new RuntimeException(reason);
    }
}
