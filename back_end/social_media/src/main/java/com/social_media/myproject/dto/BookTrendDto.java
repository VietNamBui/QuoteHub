package com.social_media.myproject.dto;

public class BookTrendDto {
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private long quoteCount;

    public BookTrendDto(Long bookId, String bookTitle, String bookAuthor, long quoteCount) {
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.bookAuthor = bookAuthor;
        this.quoteCount = quoteCount;
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

    public long getQuoteCount() {
        return quoteCount;
    }
}
