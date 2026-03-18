package org.hati.trainer.service;

import org.hati.trainer.mapper.TrainerFavMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TrainerFavServiceImpl implements TrainerFavService{
	
	@Autowired
    private TrainerFavMapper trainerFavMapper;

    @Override
    @Transactional
    public boolean toggleFav(long userAccountId, long trainerAccountId) {
        int exists = trainerFavMapper.exists(userAccountId, trainerAccountId);
        if (exists > 0) {
            trainerFavMapper.delete(userAccountId, trainerAccountId);
            return false;
        } else {
            trainerFavMapper.insert(userAccountId, trainerAccountId);
            return true;
        }
    }

    @Override
    public String getMemo(long userAccountId, long trainerAccountId) {
        int exists = trainerFavMapper.exists(userAccountId, trainerAccountId);
        if (exists == 0) return "";
        String memo = trainerFavMapper.selectMemo(userAccountId, trainerAccountId);
        return memo == null ? "" : memo;
    }

    @Override
    @Transactional
    public boolean saveMemo(long userAccountId, long trainerAccountId, String memo) {
        int exists = trainerFavMapper.exists(userAccountId, trainerAccountId);
        if (exists == 0) {
            trainerFavMapper.insert(userAccountId, trainerAccountId); // ✅ 자동 찜 생성
        }
        int updated = trainerFavMapper.updateMemo(userAccountId, trainerAccountId, memo);
        return updated > 0; // ✅ 실제 반영 여부로 리턴
    }
  
    
  
}
