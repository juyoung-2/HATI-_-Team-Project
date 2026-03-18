package org.hati.trainer.mapper;

import org.apache.ibatis.annotations.Param;

public interface TrainerFavMapper {

	int exists(@Param("userAccountId") long userAccountId,
            @Param("trainerAccountId") long trainerAccountId);

	 int insert(@Param("userAccountId") long userAccountId,
	            @Param("trainerAccountId") long trainerAccountId);
	
	 int delete(@Param("userAccountId") long userAccountId,
	            @Param("trainerAccountId") long trainerAccountId);
	
	 String selectMemo(@Param("userAccountId") long userAccountId,
	                   @Param("trainerAccountId") long trainerAccountId);
	
	 int updateMemo(@Param("userAccountId") long userAccountId,
	                @Param("trainerAccountId") long trainerAccountId,
	                @Param("memo") String memo);
	
}
