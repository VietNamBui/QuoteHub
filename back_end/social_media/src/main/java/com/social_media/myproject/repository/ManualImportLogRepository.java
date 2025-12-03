package com.social_media.myproject.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.social_media.myproject.model.ManualImportLog;
import com.social_media.myproject.model.User;

@Repository
public interface ManualImportLogRepository extends JpaRepository<ManualImportLog, Long> {

    List<ManualImportLog> findByUserOrderByImportedAtDesc(User user);

    void deleteByUser(User user);
}
