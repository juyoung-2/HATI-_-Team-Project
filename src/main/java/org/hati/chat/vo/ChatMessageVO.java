package org.hati.chat.vo; // 본인의 패키지 경로에 맞게 수정

import java.time.LocalDateTime;
import java.util.List;

import org.hati.S3.domain.MediaFile;
import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

@Data
public class ChatMessageVO {
	private int messageId;    // DB의 시퀀스값 (msg_seq)
    private int roomId;       // 방 번호 (숫자형으로 변경)
    private int senderAccountId; // 보낸 사람 ID (숫자형)
    private String messageType;	// TEXT, IMAGE, FILE 확인
    private String content;    // 메시지 내용
    private char isDeleted;	// 메시지 삭제 여부 (DB에선 삭제 안함)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss", timezone = "Asia/Seoul")
    private LocalDateTime createdAt;
    
    // 미디어 파일 리스트
    private List<MediaFile> mediaFiles;
    
    // 그룹채팅용 
    private String senderNickname;
}

