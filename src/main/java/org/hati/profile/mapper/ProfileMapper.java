package org.hati.profile.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.hati.auth.vo.AccountsVO;
import org.hati.business.vo.BusinessProfileVO;
import org.hati.profile.vo.ProfileUpdateDTO;
import org.hati.trainer.vo.TrainerPassProductVO;
import org.hati.user.vo.UserProfileVO;

public interface ProfileMapper {

	// 프로필 페이지의 주인의 정보 조회
	public AccountsVO getAccount(Long accountId);
	
	// 프로필 페이지의 주인의 프로필 조회(유저, 트레이너)
	public UserProfileVO getUserProfile(Long accountId);
	
	// 프로필 페이지의 주인의 프로필 조회(기업)
	public BusinessProfileVO getBusinessProfile(Long accountId);
	
	// 프로필 페이지의 주인의 배너 이미지 링크 조회
	public String getProfileBannerUrl(Long accountId);
	
	// 프로필 페이지의 주인의 프로필 이미지 링크 조회
	public String getProfileImageUrl(Long accountId);
	
	// 프로필 페이지의 주인의 팔로워 숫자 조회
	public int getFollowerCount(Long accountId);
	
	// 프로필 페이지의 주인의 팔로잉 숫자 조회
	public int getFollowingCount(Long accountId);

	// 프로필 페이지의 주인의 찜 받은 횟수 조회
	public int getTrainerBookingCount(Long accountId);
	
	// 프로필 페이지의 주인을 로그인한 유저가 찜 했는지 조회
	public int getTrainerBooking(@Param("loginId") Long loginId, @Param("accountId") Long accountId);
	
	// 프로필 수정시 nickname + handle 값 중복 확인
	public int nicknameHandleCheck(@Param("nickname") String nickname, @Param("handle") String handle);
	
	// 프로필 수정 accounts 테이블
	public int updateAccounts(ProfileUpdateDTO dto);
	
	// 프로필 수정 user_profile 테이블
	public int updateUserProfile(ProfileUpdateDTO dto);
	
	// 트레이너 이용권 정보 조회
	public List<TrainerPassProductVO> getTrainerPassProduct(Long accountId);
	
	// 트레이너 이용권 가격 수정
	public int updatePass(@Param("productId") Long productId, @Param("price") Long price);
	
	// 트레이너 이용권 삭제
	public int deletePass(Long productId);
	
	// 트레이너 이용권 추가
	public int insertPass(TrainerPassProductVO tvo);
	
	// 트레이너 이용권중 횟수가 1인 이용권 정보 조회
	public TrainerPassProductVO getRarinerPassProductCountOne(int accountId);
}
