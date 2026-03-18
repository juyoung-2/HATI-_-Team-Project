package org.hati.trainer.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.hati.trainer.vo.TrainerSearchConditionVO;
import org.hati.trainer.vo.TrainerSummaryVO;

@Mapper
public interface TrainerMapper {

	// 검색 전
    List<TrainerSummaryVO> selectPopularTrainers(TrainerSearchConditionVO condition); // 인기 트레이너
    List<TrainerSummaryVO> selectMatchedTrainers(TrainerSearchConditionVO condition); // 맞춤 트레이너

    // 검색 후 (필터 + 무한스크롤)
    List<TrainerSummaryVO> selectTrainerList(TrainerSearchConditionVO condition);

    int countTrainerList(TrainerSearchConditionVO condition);
    

}
