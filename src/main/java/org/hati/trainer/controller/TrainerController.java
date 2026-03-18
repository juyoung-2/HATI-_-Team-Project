package org.hati.trainer.controller;

import java.util.List;

import org.hati.trainer.service.TrainerService;
import org.hati.trainer.vo.TrainerSearchConditionVO;
import org.hati.trainer.vo.TrainerSummaryVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/trainers")
public class TrainerController {
	
	@Autowired
	private TrainerService trainerService;
	
	// 인기 트레이너 목록 조회
	@GetMapping("/popular")
	public List<TrainerSummaryVO> getPopularTrainers(@RequestParam Long loginAccountId) {
        return trainerService.getPopularTrainers(loginAccountId);
	}
	
	// 맞춤 트레이너 목록 조회
	@GetMapping("/matched")
    public List<TrainerSummaryVO> getMatchedTrainers(@RequestParam Long loginAccountId) {
        return trainerService.getMatchedTrainers(loginAccountId);
    }
	
	// 트레이너 검색  / 필터링 
	@GetMapping("/search")
    public List<TrainerSummaryVO> searchTrainers(TrainerSearchConditionVO condition) {
        return trainerService.searchTrainers(condition);
    }

	// 트레이너 찜(북마크) 토글
    @PostMapping("/{trainerId}/bookmark")
    public void toggleBookmark(@RequestParam Long accountId, @PathVariable Long trainerId) {
        trainerService.toggleBookmark(accountId, trainerId);
    }
	
	
}	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
