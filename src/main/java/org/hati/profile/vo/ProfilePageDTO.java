package org.hati.profile.vo;

import java.util.List;

import org.hati.auth.vo.AccountsVO;
import org.hati.business.vo.BusinessProfileVO;
import org.hati.user.vo.UserProfileVO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class ProfilePageDTO {
	
	// 본인의 프로필인지 확인하기 위함
	private boolean owner;
	// 프로필의 주인이 유저인지, 트레이너인지, 기업인지 확인하기 위함
	private String roleType;
	
	// 프로필의 주인의 기본 정보가 담긴 vo
	private AccountsVO avo;
	// 프로필의 주인의 닉네임 등이 담긴 vo (유저와 트레이너)
	private UserProfileVO uvo;
	// 프로필 주인의 표시명 등이 담긴 vo (기업)
	private BusinessProfileVO bvo;
	
	// 프로필 주인의 배너 이미지 경로
	private String profileBannerUrl;
	// 프로필 주인의 프로필 사진 이미지 경로
	private String profileImageUrl;
	
	// 프로필 주인의 팔로워 숫자
	private int followerCount;
	// 프로필 주인의 팔로잉 숫자
	private int followingCount;
	// 프로필 주인이 트레이너인 경우 찜 받은 숫자
	private int trainerBookingCount;
	
	// 프로필 주인(트레이너)을 로그인 한 유저가 찜 했는지 확인하기 위함
	private boolean isTrainerBooking;
	
	// 프로필 주인이 작성한 게시글 (post 기능 구현되면 활성화 시키기)
	// 프로필 페이지에 처음 오면 프로필 주인이 작성한 게시글 가져와서 출력, pin한 게시글을 제일 위에 출력
//	private List<postsVO> posts;
	
}
