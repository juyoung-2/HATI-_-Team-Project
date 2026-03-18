package org.hati.S3.domain;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaFile {
    private Long fileId;
    private Long accountId;
    private String refType;      // PROFILE, BANNER, BIZ_CERT, POST, COMMENT, CHAT, TRAINER_CERT
    private Long refId;
    private String url;
    private LocalDateTime createdAt;
    
    /**
     * 정적 팩토리 메서드
     */
    public static MediaFile of(Long accountId, String refType, Long refId, String url) {
        return MediaFile.builder()
                .accountId(accountId)
                .refType(refType)
                .refId(refId)
                .url(url)
                .build();
    }
}
