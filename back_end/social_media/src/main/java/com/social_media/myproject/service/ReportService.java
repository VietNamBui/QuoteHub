package com.social_media.myproject.service;

import java.util.List;

import com.social_media.myproject.model.Report;
import com.social_media.myproject.model.Twit;
import com.social_media.myproject.model.User;

public interface ReportService {

    Report createReport(User reporter, Twit twit, String reason);

    List<Report> findPendingReports();
}
