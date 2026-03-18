package org.hati.trainer.service;


public interface TrainerFavService {
	
	 boolean toggleFav(long userAccountId, long trainerAccountId);
     String getMemo(long userAccountId, long trainerAccountId);
     boolean saveMemo(long userAccountId, long trainerAccountId, String memo);
	
}
