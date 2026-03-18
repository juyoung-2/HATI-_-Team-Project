package org.hati.S3.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Param;
import org.hati.S3.domain.MediaFile;

public interface MediaFileMapper {

    /**
     * 파일 정보 DB 등록
     */
    void insertMediaFile(MediaFile mediaFile);

    /**
     * 단일 파일 조회 (프로필, 배너, 사업자등록증)
     * - accountId, refType, refId로 특정
     */
    MediaFile findSingleFile(
            @Param("accountId") Long accountId,
            @Param("refType") String refType,
            @Param("refId") Long refId
    );

    /**
     * 특정 ref의 전체 파일 조회 (게시글, 댓글, 채팅)
     * - refType과 refId로 검색
     */
    List<MediaFile> findFiles(
            @Param("refType") String refType,
            @Param("refId") Long refId
    );

    /**
     * URL로 파일 삭제
     */
    void deleteByUrl(@Param("url") String url);

    /**
     * ref 기준 전체 삭제 (게시글 삭제 시)
     */
    void deleteByRef(
            @Param("refType") String refType,
            @Param("refId") Long refId
    );
    
    MediaFile findByMediaId(@Param("mediaId") Long mediaId);

    int deleteByMediaId(@Param("mediaId") Long mediaId);

    List<MediaFile> findFilesByMediaIds(@Param("mediaIds") List<Long> mediaIds);
}
