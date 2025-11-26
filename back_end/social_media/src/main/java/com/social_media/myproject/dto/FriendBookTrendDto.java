package com.social_media.myproject.dto;

public class FriendBookTrendDto {
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private long friendCount;
    private long twitCount;

    public FriendBookTrendDto(Long bookId, String bookTitle, String bookAuthor, long friendCount, long twitCount) {
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.bookAuthor = bookAuthor;
        this.friendCount = friendCount;
        this.twitCount = twitCount;
    }

    public Long getBookId() {
        return bookId;
    }

    public String getBookTitle() {
        return bookTitle;
    }

    public String getBookAuthor() {
        return bookAuthor;
    }

    public long getFriendCount() {
        return friendCount;
    }

    public long getTwitCount() {
        return twitCount;
    }
}
