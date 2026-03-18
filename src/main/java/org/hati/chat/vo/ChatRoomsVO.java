package org.hati.chat.vo; // 본인의 패키지 경로에 맞게 수정

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class ChatRoomsVO {
	private int roomId;
	private String roomType;
	private String roomTitle;	// 1:1 인지 openChat인지
	private int isPrivate;		// 공개 : 비공개
	private String inviteCode;	// 비공개시 입장 코드
	private int bjAccountId; 	// openChat 방장이 누구인지, 1:1채팅시엔 null
	private String description; // openChat 설명
	private int maxMembers;		// openChat 최대 인원
	private String roomImage; 	// openChat 프로필 사진
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;
}

