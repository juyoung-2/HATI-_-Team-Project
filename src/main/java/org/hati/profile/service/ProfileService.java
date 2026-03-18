package org.hati.profile.service;

import java.util.List;

import org.hati.profile.vo.ProfilePageDTO;
import org.hati.profile.vo.ProfileUpdateDTO;
import org.hati.trainer.vo.TrainerPassProductVO;

public interface ProfileService {
	
	// 프로필 페이지로 이동하기 전 필요한 정보를 담아서 이동
	public ProfilePageDTO getProfilePage(Long accountId, Long loginId);
	
	// 프로필 수정시 nickname + handle 값 중복 확인
	public int nicknameHandleCheck(String nickname, String handle);
	
	// 프로필 수정
	public int updateProfile(ProfileUpdateDTO dto);
	
	// 트레이너 이용권 조회
	public List<TrainerPassProductVO> getTrainerPassProduct(Long accountId);
	
	// 트레이너 이용권 가격 수정
	public int updatePass(Long productId, Long price);
	
	// 트레이너 이용권 삭제
	public int deletePass(Long productId);
	
	// 트레이너 이용권 추가
	public int insertPass(TrainerPassProductVO tvo);
}
