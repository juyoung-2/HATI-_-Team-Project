package org.hati.trainer.service;

import java.util.List;

import org.hati.trainer.vo.TrainerSearchConditionVO;
import org.hati.trainer.vo.TrainerSummaryVO;

public interface TrainerService {
	
	// 검색 전
    List<TrainerSummaryVO> getPopularTrainers(Long  loginAccountId);  // 인기 트레이너
    List<TrainerSummaryVO> getMatchedTrainers(Long  loginAccountId);  // 맞춤 트레이너

    // 검색 후
    List<TrainerSummaryVO> searchTrainers(TrainerSearchConditionVO condition);
    List<TrainerSummaryVO> searchPopularTrainers(TrainerSearchConditionVO condition); //(인기/기간 score 정렬)

    int countTrainerList(TrainerSearchConditionVO condition);
    
    // 찜
    void toggleBookmark(Long accountId, Long trainerAccountId);
    
   /* class BookmarkToggleResult {
        private boolean bookmarked; // 토글 후 상태
        public BookmarkToggleResult(boolean bookmarked){ this.bookmarked = bookmarked; }
        public boolean isBookmarked(){ return bookmarked; }
    }
    */
	
    
    
}
