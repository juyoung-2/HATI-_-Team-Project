package org.hati.trainer.service;

import java.util.List;

import org.hati.trainer.mapper.TrainerFavMapper;
import org.hati.trainer.mapper.TrainerMapper;
import org.hati.trainer.vo.TrainerSearchConditionVO;
import org.hati.trainer.vo.TrainerSummaryVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TrainerServiceImpl implements TrainerService {

	@Autowired
	private TrainerFavMapper trainerFavMapper;
	
    private final TrainerMapper trainerMapper;

    @Override
    public List<TrainerSummaryVO> getPopularTrainers(Long loginAccountId) {
        TrainerSearchConditionVO condition = new TrainerSearchConditionVO();
        condition.setLoginAccountId(loginAccountId);

        condition.setOffset(0);
        condition.setLimit(6);

        return trainerMapper.selectPopularTrainers(condition);
    }

    @Override
    public List<TrainerSummaryVO> getMatchedTrainers(Long loginAccountId) {
        TrainerSearchConditionVO condition = new TrainerSearchConditionVO();
        condition.setLoginAccountId(loginAccountId);

        condition.setOffset(0);
        condition.setLimit(6);

        return trainerMapper.selectMatchedTrainers(condition);
    }

    @Override
    public List<TrainerSummaryVO> searchTrainers(TrainerSearchConditionVO condition) {
        if (condition == null) {
            condition = new TrainerSearchConditionVO();
        }
        if (condition.getLimit() <= 0) condition.setLimit(12);
        if (condition.getOffset() < 0) condition.setOffset(0);

        return trainerMapper.selectTrainerList(condition);
    }

    @Override
    public List<TrainerSummaryVO> searchPopularTrainers(TrainerSearchConditionVO condition) {
        if (condition == null) {
            condition = new TrainerSearchConditionVO();
        }
        if (condition.getLimit() <= 0) condition.setLimit(12);
        if (condition.getOffset() < 0) condition.setOffset(0);

        return trainerMapper.selectPopularTrainers(condition);
    }
    
    
    @Override
    public int countTrainerList(TrainerSearchConditionVO condition) {
        if (condition == null) {
            condition = new TrainerSearchConditionVO();
        }
        return trainerMapper.countTrainerList(condition);
    }
    
    @Transactional
    @Override
    public void toggleBookmark(Long accountId, Long trainerAccountId) {
        // exists는 COUNT(*)라 0/1 이상 가능 -> >0 기준이 안전
    	 int exists = trainerFavMapper.exists(accountId, trainerAccountId);

    	    if (exists > 0) {
    	        trainerFavMapper.delete(accountId, trainerAccountId);
    	    } else {
    	        trainerFavMapper.insert(accountId, trainerAccountId);
    	    }
    }
}
