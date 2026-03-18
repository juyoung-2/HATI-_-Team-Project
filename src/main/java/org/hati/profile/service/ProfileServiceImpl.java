package org.hati.profile.service;

import java.util.List;

import org.hati.auth.vo.AccountsVO;
import org.hati.profile.mapper.ProfileMapper;
import org.hati.profile.vo.ProfilePageDTO;
import org.hati.profile.vo.ProfileUpdateDTO;
import org.hati.trainer.vo.TrainerPassProductVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.log4j.Log4j;

@Log4j
@Service
public class ProfileServiceImpl implements ProfileService {
	
	@Autowired
	private ProfileMapper pmapper;
	
	@Override
	public ProfilePageDTO getProfilePage(Long accountId, Long loginId) {
		
		// 프로필 페이지로 이동하기 전 필요한 정보를 담는 객체
		ProfilePageDTO dto = new ProfilePageDTO();

		// 프로필 페이지의 주인 조회
		log.info("프로필 조회 시작 - accountId: " + accountId + ", loginId: " + loginId);
		AccountsVO profileOwner = pmapper.getAccount(accountId);
		
		// 프로필 페이지의 주인의 계정 정보 넣기
		dto.setAvo(profileOwner);
		
		// 프로필 페이지의 주인이 로그인 한 유저인지 확인
		dto.setOwner(loginId.equals(accountId));
		
		// 프로필 페이지의 주인의 권한 조회
		dto.setRoleType(profileOwner.getRoleType());
		
		// 프로필 페이지의 주인의 프로필 조회
		// 권한이 유저나 트레이너면 userProfile을 가져옴
		if(dto.getRoleType().equals("USER") || dto.getRoleType().equals("TRAINER")) {
			dto.setUvo(pmapper.getUserProfile(accountId)); 
		}
		// 권한이 기업이면 businessProfile을 가져옴
		else {
			dto.setBvo(pmapper.getBusinessProfile(accountId));
		}
		
		// 프로필 페이지의 주인의 배너 이미지 링크 조회
		dto.setProfileBannerUrl(pmapper.getProfileBannerUrl(accountId));
		
		// 프로필 페이지의 주인의 프로필 이미지 링크 조회
		dto.setProfileImageUrl(pmapper.getProfileImageUrl(accountId));
		
		// 프로필 페이지의 주인의 팔로워 숫자 조회
		dto.setFollowerCount(pmapper.getFollowerCount(accountId));
		
		// 프로필 페이지의 주인의 팔로잉 숫자 조회
		dto.setFollowingCount(pmapper.getFollowingCount(accountId));
		
		// 프로필 페이지의 주인이 트레이너인 경우 찜 조회
		if(dto.getRoleType().equals("TRAINER")){
			// 프로필 페이지의 주인의 찜 받은 횟수 조회
			dto.setTrainerBookingCount(pmapper.getTrainerBookingCount(accountId));
			// 프로필 페이지의 주인을 로그인한 유저가 찜 했는지 조회
			dto.setTrainerBooking(pmapper.getTrainerBooking(loginId, accountId) == 1);
		}
		
		log.info("프로필 조회 완료 - accountId: " + accountId + ", roleType: " + dto.getRoleType());
		
		return dto;
	}
	
	// 프로필 수정시 nickname + handle 값 중복 확인
	@Override
	public int nicknameHandleCheck(String nickname, String handle) {
		return pmapper.nicknameHandleCheck(nickname, handle);
	}
	
	// 프로필 수정
	@Override
	public int updateProfile(ProfileUpdateDTO dto) {
		System.out.println(dto.getAccountId());
		// accounts 테이블 수정
		int upAcc = pmapper.updateAccounts(dto);
		// user_profile 테이블 수정
		int upUpr = pmapper.updateUserProfile(dto);
		
		// 두 테이블의 수정이 모두 성공시
		if(upAcc + upUpr == 2) {
			return 1;			
		}
		// 두 테이블중 하나라도 수정 실패시
		else {
			return 0;
		}
	}
	
	// 트레이너 이용권 조회
	@Override
	public List<TrainerPassProductVO> getTrainerPassProduct(Long accountId) {
		return pmapper.getTrainerPassProduct(accountId);
	}
	
	// 트레이너 이용권 가격 수정
	@Override
	public int updatePass(Long productId, Long price) {
		return pmapper.updatePass(productId, price);
	}
	
	// 트레이너 이용권 삭제
	@Override
	public int deletePass(Long productId) {
		return pmapper.deletePass(productId);
	}
	
	// 트레이너 이용권 추가
	@Override
	public int insertPass(TrainerPassProductVO tvo) {
		// 트레이너 이용권중 횟수가 1인 이용권 정보 조회
		TrainerPassProductVO tvoCnt1 = pmapper.getRarinerPassProductCountOne(tvo.getTrainerAccountId());
		// 횟수가 1인 이용권에서 sport_id와 base_fee를 가져와서 tvo에 추가
		tvo.setSportId(tvoCnt1.getSportId());
		tvo.setBaseFee(tvoCnt1.getBaseFee());
		return pmapper.insertPass(tvo);
	}
}
