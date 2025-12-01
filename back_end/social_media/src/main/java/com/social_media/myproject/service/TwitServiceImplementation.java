package com.social_media.myproject.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.Collections;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.social_media.myproject.dto.BookTrendDto;
import com.social_media.myproject.dto.FriendBookTrendDto;
import com.social_media.myproject.exception.TwitException;
import com.social_media.myproject.exception.UserException;
import com.social_media.myproject.model.Book;
import com.social_media.myproject.model.Quote;
import com.social_media.myproject.model.Twit;
import com.social_media.myproject.model.TwitRetwitUser;
import com.social_media.myproject.model.User;
import com.social_media.myproject.repository.LikeRepository;
import com.social_media.myproject.repository.QuoteRepository;
import com.social_media.myproject.repository.TwitRepository;
import com.social_media.myproject.model.Report;
import com.social_media.myproject.repository.ReportRepository;
import com.social_media.myproject.request.TwitReplyReques;

@Service
public class TwitServiceImplementation implements TwitService{
	
	@Autowired
	private TwitRepository twitRepository;

	@Autowired
	private QuoteRepository quoteRepository;

	@Autowired
	private com.social_media.myproject.repository.NotificationRepository notificationRepository;

	@Autowired
	private NotificationService notificationService;

	@Autowired
	private AIClassificationService aiClassificationService;
	
	@Autowired
	private ReportRepository reportRepository;

	@Autowired
	private SimpMessagingTemplate messagingTemplate;

	@Override
	public Twit createTwit(Twit req, User user) throws UserException {
		if (req.getQuote() == null || req.getQuote().getId() == null) {
			throw new RuntimeException("Quote is required to create a twit");
		}
		// Kiểm duyệt nội dung twit trước khi lưu, gán trạng thái nhiều mức
		AIClassificationService.ModerationResult mr = aiClassificationService.moderate(req.getContent());
		Quote quote = quoteRepository.findById(req.getQuote().getId())
				.orElseThrow(() -> new RuntimeException("Quote not found with id " + req.getQuote().getId()));
		
		Twit twit = new Twit();
		twit.setContent(req.getContent());
		twit.setCreatedAt(LocalDateTime.now());
		twit.setImage(req.getImage());
		twit.setUser(user);
		twit.setIsReply(false);
		twit.setIsTwit(true);
		twit.setQuote(quote);
		// Ghi lại thông tin kiểm duyệt từ AI
		twit.setAiRiskScore(mr.riskScore);
		twit.setAiCategories(mr.categories == null || mr.categories.isEmpty()
			? null
			: String.join(", ", mr.categories));
		// Chính sách nhiều lớp: nếu rủi ro thấp -> APPROVED, trung bình -> PENDING, cao -> BLOCKED
		if (mr.safe || mr.riskScore < 0.3) {
			twit.setModerationStatus("APPROVED");
		} else if (mr.riskScore < 0.7) {
			twit.setModerationStatus("PENDING");
			twit.setModerationReason("AI nghi ngờ: " + twit.getAiCategories());
		} else {
			// Vi phạm nặng: BLOCKED nhưng vẫn lưu vào DB để phục vụ thống kê / kiểm tra admin
			twit.setModerationStatus("BLOCKED");
			twit.setModerationReason("AI đánh giá vi phạm nặng: " + twit.getAiCategories());
		}
		
		Twit saved = twitRepository.save(twit);
		// Chỉ gửi thông báo cho followers nếu bài không bị BLOCKED
		if (!"BLOCKED".equals(saved.getModerationStatus())) {
			notificationService.createNewTwitNotificationForFollowers(user, saved);
		}
		// Báo cho admin rằng số liệu analytics & moderation có thay đổi
		if (messagingTemplate != null) {
			messagingTemplate.convertAndSend("/topic/admin/analytics", "ANALYTICS_UPDATED");
			messagingTemplate.convertAndSend("/topic/admin/moderation", "MODERATION_UPDATED");
		}
		
		return saved;
	}

	@Override
	public List<Twit> findAllTwit(User currentUser) {
		// Lấy toàn bộ twit chính (isTwit = true), sort theo thời gian mới nhất
		List<Twit> all = twitRepository.findAllByIsTwitTrueOrderByCreatedAtDesc();
		// Ẩn các bài đã bị REJECTED hoặc BLOCKED khỏi luồng chung
		all = all.stream()
			.filter(t -> {
				String s = t.getModerationStatus();
				return s == null || "APPROVED".equals(s) || "PENDING".equals(s);
			})
			.collect(Collectors.toList());
		if (currentUser == null || all.isEmpty()) {
			return all;
		}
		
		// Danh sách userId mà currentUser đang follow
		Set<Long> followingIds = currentUser.getFollowings() == null
			? new HashSet<>()
			: currentUser.getFollowings().stream()
				.map(User::getId)
				.collect(Collectors.toSet());
		
		// Nếu chưa follow ai thì trả luôn danh sách global
		if (followingIds.isEmpty()) {
			return all;
		}
		
		List<Twit> priority = new ArrayList<>(); // twit của người mình follow
		List<Twit> others = new ArrayList<>();   // twit của user khác
		
		for (Twit t : all) {
			if (t.getUser() != null && followingIds.contains(t.getUser().getId())) {
				priority.add(t);
			} else {
				others.add(t);
			}
		}
		
		// Trộn: cứ 4 twit từ following thì chèn 1 twit bất kỳ từ others
		List<Twit> mixed = new ArrayList<>();
		int insertEvery = 5; // 4 following + 1 random khác
		int i = 0, j = 0, count = 0;
		
		while (i < priority.size() || j < others.size()) {
			if (i < priority.size()) {
				mixed.add(priority.get(i++));
				count++;
			}
			if (count > 0 && count % insertEvery == 0 && j < others.size()) {
				mixed.add(others.get(j++));
			}
		}
		
		// Nếu vẫn còn twit khác thì thêm nốt vào cuối
		while (j < others.size()) {
			mixed.add(others.get(j++));
		}
		
		return mixed;
	}

	@Override
	public List<Twit> getFeedTwits(User currentUser) {
		// Nếu chưa đăng nhập thì không có feed cá nhân
		if (currentUser == null) {
			return Collections.emptyList();
		}

		// Lấy toàn bộ twit chính theo thời gian mới nhất
		List<Twit> all = twitRepository.findAllByIsTwitTrueOrderByCreatedAtDesc();
		// Ẩn các bài đã bị REJECTED hoặc BLOCKED khỏi newsfeed
		all = all.stream()
			.filter(t -> {
				String s = t.getModerationStatus();
				return s == null || "APPROVED".equals(s) || "PENDING".equals(s);
			})
			.collect(Collectors.toList());
		if (all.isEmpty()) {
			return all;
		}

		Long myId = currentUser.getId();
		Set<Long> followingIds = currentUser.getFollowings() == null
			? new HashSet<>()
			: currentUser.getFollowings().stream()
				.map(User::getId)
				.collect(Collectors.toSet());

		return all.stream()
			.filter(t -> t.getUser() != null &&
				(
					Objects.equals(t.getUser().getId(), myId) ||
					followingIds.contains(t.getUser().getId())
				)
			)
			.collect(Collectors.toList());
	}

//	@Override
//	public Twit retwit(Long twitId, User user) throws UserException, TwitException {
//		Twit twit = findById(twitId);
//		
//		if(twit.getRetwits().contains(user)) {
//			twit.getRetwits().remove(user);
//		} else {
//			twit.getRetwits().add(user);
//		}
//		
//		return twitRepository.save(twit);
//	}
	
	@Override
	public Twit retwit(Long twitId, User user) throws UserException, TwitException {
	    Twit twit = findById(twitId);

	    // Kiểm tra xem user đã retweet chưa
	    TwitRetwitUser existing = twit.getRetwits().stream()
	        .filter(tr -> tr.getUser().getId().equals(user.getId()))
	        .findFirst()
	        .orElse(null);

	    if (existing != null) {
	        // Nếu đã retweet, remove retweet
	        twit.getRetwits().remove(existing);
	    } else {
	        // Nếu chưa retweet, tạo mới TwitRetwitUser
	        TwitRetwitUser trUser = new TwitRetwitUser();
	        trUser.setTwit(twit);
	        trUser.setUser(user);
	        twit.getRetwits().add(trUser);
	    }

	    return twitRepository.save(twit);
	}


	@Override
	public Twit findById(Long twitId) throws TwitException {
		Twit twit = twitRepository.findById(twitId)
				.orElseThrow(()-> new TwitException("Twit not found with id" + twitId));

		return twit;
	}

	@Override
	@Transactional
	public void deleteTwitById(Long twitId, Long userId) throws TwitException, UserException {
		
		Twit twit = findById(twitId);
		
		if(!userId.equals(twit.getUser().getId())) {
			throw new UserException("you can't delete another user's twit");
		}
		// Xóa toàn bộ notification liên quan đến twit này trước, tránh lỗi khóa ngoại
		notificationRepository.deleteByTwit(twit);
		
		twitRepository.deleteById(twit.getId());
	}

	@Override
	public Twit updateTwitContent(Long twitId, String content, Long quoteId, User currentUser) throws TwitException, UserException {
		Twit twit = findById(twitId);
		if (currentUser == null || twit.getUser() == null || !twit.getUser().getId().equals(currentUser.getId())) {
			throw new UserException("you can't edit another user's twit");
		}
		if (content != null) {
			twit.setContent(content);
		}
		if (quoteId != null) {
			Quote quote = quoteRepository.findById(quoteId)
				.orElseThrow(() -> new TwitException("Quote not found with id " + quoteId));
			twit.setQuote(quote);
		}
		return twitRepository.save(twit);
	}

	@Override
	public Twit removeFromRetwit(Long twitId, User user) throws TwitException, UserException {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public Twit createdReply(TwitReplyReques req, User user) throws TwitException {
		
		Twit replyFor=findById(req.getTwitId());
		// Kiểm duyệt nội dung reply trước khi lưu, gán trạng thái nhiều mức
		AIClassificationService.ModerationResult mr = aiClassificationService.moderate(req.getContent());
		
		Twit twit = new Twit();
		twit.setContent(req.getContent());
		twit.setCreatedAt(LocalDateTime.now());
		twit.setImage(req.getImage());
		twit.setUser(user);
		twit.setIsReply(true);
		twit.setIsTwit(false);
		twit.setReplyFor(replyFor);
		// Ghi lại thông tin kiểm duyệt từ AI
		twit.setAiRiskScore(mr.riskScore);
		twit.setAiCategories(mr.categories == null || mr.categories.isEmpty()
			? null
			: String.join(", ", mr.categories));
		if (mr.safe || mr.riskScore < 0.3) {
			twit.setModerationStatus("APPROVED");
		} else if (mr.riskScore < 0.7) {
			twit.setModerationStatus("PENDING");
			twit.setModerationReason("AI nghi ngờ: " + twit.getAiCategories());
		} else {
			twit.setModerationStatus("BLOCKED");
			twit.setModerationReason("AI đánh giá vi phạm nặng: " + twit.getAiCategories());
		}
		
		Twit savedReply = twitRepository.save(twit);
		
		// Chỉ gắn vào danh sách reply & gửi notification nếu reply không bị BLOCKED
		if (!"BLOCKED".equals(savedReply.getModerationStatus())) {
			replyFor.getReplyTwits().add(savedReply);
			twitRepository.save(replyFor);
			
			// Tạo notification cho chủ bài gốc khi có reply từ người khác
			if (replyFor.getUser() != null) {
				notificationService.createReplyNotification(user, replyFor.getUser(), replyFor);
			}
		}
		// Báo cho admin rằng moderation có thay đổi (reply bị nghi ngờ / bị chặn)
		if (messagingTemplate != null) {
			messagingTemplate.convertAndSend("/topic/admin/moderation", "MODERATION_UPDATED");
		}
		
		return replyFor;
	}

	@Override
	public List<Twit> getUserTwit(User user) {
		// Lấy tất cả twit chính rồi lọc theo user
		List<Twit> all = twitRepository.findAllByIsTwitTrueOrderByCreatedAtDesc();
		if (all.isEmpty() || user == null) return List.of();
		Long userId = user.getId();
		return all.stream()
			.filter(t -> t.getUser() != null && t.getUser().getId().equals(userId))
			.toList();
	}

	@Override
	public List<Twit> getUserReplies(User user) {
		if (user == null) return List.of();
		Long userId = user.getId();
		List<Twit> all = twitRepository.findAll();
		if (all.isEmpty()) return List.of();
		java.util.Set<Long> parentIds = new java.util.HashSet<>();
		List<Twit> parents = new java.util.ArrayList<>();
		for (Twit t : all) {
			if (Boolean.TRUE.equals(t.getIsReply())
				&& t.getUser() != null && t.getUser().getId().equals(userId)
				&& t.getReplyFor() != null) {
				Twit parent = t.getReplyFor();
				if (!parentIds.contains(parent.getId())) {
					parentIds.add(parent.getId());
					parents.add(parent);
				}
			}
		}
		return parents;
	}

	@Override
	public List<Twit> findByLikesContainsUser(User user) {
		
		return twitRepository.findByLikesUser_id(user.getId());
	}

	@Override
	public List<BookTrendDto> getTrendingBooks() {
		// Lấy tất cả twit chính gắn với quote & book
		List<Twit> all = twitRepository.findAllByIsTwitTrueOrderByCreatedAtDesc();
		if (all.isEmpty()) return List.of();

		Map<Long, Long> countByBook = all.stream()
			.filter(t -> t.getQuote() != null && t.getQuote().getBook() != null)
			.collect(Collectors.groupingBy(
					 t -> t.getQuote().getBook().getId(),
					 Collectors.counting()
			));

		// Map sang DTO và sort theo số lượng giảm dần, lấy top 5
		List<BookTrendDto> result = countByBook.entrySet().stream()
			.sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
			.limit(5)
			.map(e -> {
				Long bookId = e.getKey();
				long count = e.getValue();
				Book book = all.stream()
					.filter(t -> t.getQuote() != null && t.getQuote().getBook() != null
							&& t.getQuote().getBook().getId().equals(bookId))
					.map(t -> t.getQuote().getBook())
					.findFirst()
					.orElse(null);
				if (book == null) return null;
				return new BookTrendDto(
					book.getId(),
					book.getTitle(),
					book.getAuthor(),
					count
				);
			})
			.filter(dto -> dto != null)
			.collect(Collectors.toList());

		return result;
	}

	@Override
	public List<FriendBookTrendDto> getFriendsTrendingBooks(User currentUser) {
		if (currentUser == null || currentUser.getFollowings() == null || currentUser.getFollowings().isEmpty()) {
			return List.of();
		}

		Set<Long> followingIds = currentUser.getFollowings().stream()
			.map(User::getId)
			.collect(Collectors.toSet());

		List<Twit> all = twitRepository.findAllByIsTwitTrueOrderByCreatedAtDesc();
		if (all.isEmpty()) return List.of();

		// Chỉ lấy twit của bạn bè và có book
		List<Twit> friendTwits = all.stream()
			.filter(t -> t.getUser() != null && followingIds.contains(t.getUser().getId()))
			.filter(t -> t.getQuote() != null && t.getQuote().getBook() != null)
			.toList();

		if (friendTwits.isEmpty()) return List.of();

		// Đếm số twit theo book
		Map<Long, Long> twitCountByBook = friendTwits.stream()
			.collect(Collectors.groupingBy(
					 t -> t.getQuote().getBook().getId(),
					 Collectors.counting()
			));

		// Đếm số bạn khác nhau theo book
		Map<Long, Long> friendCountByBook = friendTwits.stream()
			.collect(Collectors.groupingBy(
					 t -> t.getQuote().getBook().getId(),
					 Collectors.mapping(t -> t.getUser().getId(), Collectors.toSet())
			))
			.entrySet().stream()
			.collect(Collectors.toMap(Map.Entry::getKey, e -> (long) e.getValue().size()));

		List<FriendBookTrendDto> result = twitCountByBook.entrySet().stream()
			.sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
			.limit(5)
			.map(e -> {
				Long bookId = e.getKey();
				long twitCount = e.getValue();
				long friendCount = friendCountByBook.getOrDefault(bookId, 0L);
				Book book = friendTwits.stream()
					.filter(t -> t.getQuote().getBook().getId().equals(bookId))
					.map(t -> t.getQuote().getBook())
					.findFirst()
					.orElse(null);
				if (book == null) return null;
				return new FriendBookTrendDto(
					book.getId(),
					book.getTitle(),
					book.getAuthor(),
					friendCount,
					twitCount
				);
			})
			.filter(dto -> dto != null)
			.collect(Collectors.toList());

		return result;
	}

	@Override
	public Twit approveModeration(Long twitId) throws TwitException {
		Twit twit = findById(twitId);
		if (twit == null) {
			throw new TwitException("Twit not found with id" + twitId);
		}
		twit.setModerationStatus("APPROVED");
		// Đánh dấu các report liên quan là REJECTED (báo cáo sai, bài được giữ lại)
		java.util.List<Report> reports = reportRepository.findByTwitAndStatus(twit, "PENDING");
		for (Report r : reports) {
			 r.setStatus("REJECTED");
		}
		if (!reports.isEmpty()) {
			reportRepository.saveAll(reports);
		}
		Twit saved = twitRepository.save(twit);
		if (messagingTemplate != null) {
			messagingTemplate.convertAndSend("/topic/admin/analytics", "ANALYTICS_UPDATED");
			messagingTemplate.convertAndSend("/topic/admin/moderation", "MODERATION_UPDATED");
			// Báo cho client (newsfeed) biết bài này được giữ lại
			java.util.Map<String, Object> payload = new java.util.HashMap<>();
			payload.put("twitId", saved.getId());
			payload.put("action", "SHOW");
			messagingTemplate.convertAndSend("/topic/feed/moderation", payload);
		}
		return saved;
	}

	@Override
	public Twit rejectModeration(Long twitId, String reason) throws TwitException {
		Twit twit = findById(twitId);
		if (twit == null) {
			throw new TwitException("Twit not found with id" + twitId);
		}
		twit.setModerationStatus("REJECTED");
		if (reason != null && !reason.isBlank()) {
			twit.setModerationReason(reason);
		}
		java.util.List<Report> reports = reportRepository.findByTwitAndStatus(twit, "PENDING");
		for (Report r : reports) {
			 r.setStatus("REVIEWED");
		}
		if (!reports.isEmpty()) {
			reportRepository.saveAll(reports);
		}
		Twit saved = twitRepository.save(twit);
		if (messagingTemplate != null) {
			messagingTemplate.convertAndSend("/topic/admin/analytics", "ANALYTICS_UPDATED");
			messagingTemplate.convertAndSend("/topic/admin/moderation", "MODERATION_UPDATED");
			// Báo cho client (newsfeed/profile) biết bài này bị ẩn
			java.util.Map<String, Object> payload = new java.util.HashMap<>();
			payload.put("twitId", saved.getId());
			payload.put("action", "HIDE");
			messagingTemplate.convertAndSend("/topic/feed/moderation", payload);
		}
		return saved;
	}

	@Override
	public List<Twit> findPendingModerationTwits() {
		return twitRepository.findByModerationStatusOrderByCreatedAtDesc("PENDING");
	}

	@Override
	public List<Twit> findTwitsByModerationStatus(String status) {
		if (status == null) return java.util.List.of();
		return twitRepository.findByModerationStatusOrderByCreatedAtDesc(status);
	}

}
