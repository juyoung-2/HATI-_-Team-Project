package org.hati.S3.service;

import java.util.List;
import java.util.stream.Collectors;

import org.hati.S3.domain.MediaFile;
import org.hati.S3.mapper.MediaFileMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MediaFileService {

    private static final Logger log = LoggerFactory.getLogger(MediaFileService.class);

    private final S3Service s3Service;
    private final MediaFileMapper mediaFileMapper;
    
    @Autowired
    public MediaFileService(S3Service s3Service, MediaFileMapper mediaFileMapper) {
        this.s3Service = s3Service;
        this.mediaFileMapper = mediaFileMapper;
    }

    // ================================
    // PUBLIC API - Controller에서 호출
    // ================================

    /**
     * 프로필 이미지 업로드/수정
     */
    @Transactional
    public String uploadProfileImage(Long accountId, MultipartFile file) {
        return replaceSingleFile(accountId, "PROFILE", accountId, file, "profile");
    }

    /**
     * 배너 이미지 업로드/수정
     */
    @Transactional
    public String uploadBannerImage(Long accountId, MultipartFile file) {
        return replaceSingleFile(accountId, "BANNER", accountId, file, "banner");
    }

    /**
     * 사업자 등록증 업로드/수정
     */
    @Transactional
    public String uploadBizCert(Long accountId, MultipartFile file) {
        return replaceSingleFile(accountId, "BIZ_CERT", accountId, file, "biz-cert");
    }

    /**
     * 게시글 이미지 여러 개 업로드
     */
    @Transactional
    public void uploadPostImages(Long accountId, Long postId, List<MultipartFile> files) {
        uploadMultipleFiles(accountId, "POST", postId, files, "post");
    }

    /**
     * 게시글 이미지 수정 (유지 + 삭제 + 추가)
     */
    @Transactional
    public void syncPostImages(Long accountId, Long postId, List<String> remainUrls, List<MultipartFile> newFiles) {
        syncMultipleFiles(accountId, "POST", postId, remainUrls, newFiles, "post");
    }

    /**
     * 댓글 이미지 업로드
     */
    @Transactional
    public void uploadCommentImages(Long accountId, Long commentId, List<MultipartFile> files) {
        uploadMultipleFiles(accountId, "COMMENT", commentId, files, "comment");
    }

    /**
     * 댓글 이미지 수정 (유지 + 삭제 + 추가)
     */
    @Transactional
    public void syncCommentImages(Long accountId, Long commentId, List<String> remainUrls, List<MultipartFile> newFiles) {
        syncMultipleFiles(accountId, "COMMENT", commentId, remainUrls, newFiles, "comment");
    }

    /**
     * 채팅 이미지 업로드
     */
    @Transactional
    public void uploadChatImages(Long accountId, Long chatId, List<MultipartFile> files) {
        uploadMultipleFiles(accountId, "CHAT_IMG", chatId, files, "chat");
    }

    /**
     * 채팅 이미지 수정 (유지 + 삭제 + 추가)
     */
    @Transactional
    public void syncChatImages(Long accountId, Long chatId, List<String> remainUrls, List<MultipartFile> newFiles) {
        syncMultipleFiles(accountId, "CHAT_IMG", chatId, remainUrls, newFiles, "chat");
    }
    
    /**
     * 채팅 파일 업로드
     */
    @Transactional
    public void uploadChatFiles(Long accountId, Long chatId, List<MultipartFile> files) {
        uploadMultipleFiles(accountId, "CHAT_FILE", chatId, files, "chat");
    }

    /**
     * 채팅 파일 수정 (유지 + 삭제 + 추가)
     */
    @Transactional
    public void syncChatFiles(Long accountId, Long chatId, List<String> remainUrls, List<MultipartFile> newFiles) {
        syncMultipleFiles(accountId, "CHAT_FILE", chatId, remainUrls, newFiles, "chat");
    }

    /**
     * 트레이너 자격증 업로드
     */
    @Transactional
    public void uploadTrainerCert(Long trainerId, List<MultipartFile> files) {
        uploadMultipleFiles(trainerId, "TRAINER_CERT", trainerId, files, "trainer-cert");
    }

    /**
     * 트레이너 자격증 수정 (유지 + 삭제 + 추가)
     */
    @Transactional
    public void syncTrainerCert(Long accountId, Long trainerId, List<String> remainUrls, List<MultipartFile> newFiles) {
        syncMultipleFiles(accountId, "TRAINER_CERT", trainerId, remainUrls, newFiles, "trainer-cert");
    }

    /**
     * 특정 ref의 모든 파일 삭제
     */
    @Transactional
    public void deleteAllByRef(String refType, Long refId) {
        deleteAllFiles(refType, refId);
    }
    
    @Transactional
    public void deletePostImagesByMediaIds(Long accountId, Long postId, List<Long> mediaIds) {
        deleteFilesByMediaIds(accountId, "POST", postId, mediaIds);
    }

    // ================================
    // PRIVATE 헬퍼 메서드
    // ================================

    /**
     * 1. 단일 파일 교체 로직 (프로필/배너/사업자등록증)
     * - 기존 파일이 있으면 S3 + DB 삭제
     * - 새 파일 업로드 후 DB 저장
     */
    private String replaceSingleFile(Long accountId, String refType, Long refId, 
                                      MultipartFile newFile, String dir) {
        
        log.info("단일 파일 교체 시작 - accountId: " + accountId + ", refType: " + refType + ", refId: " + refId);

        // 1) 기존 파일 조회
        MediaFile oldFile = mediaFileMapper.findSingleFile(accountId, refType, refId);

        // 2) 기존 파일이 있으면 삭제
        if (oldFile != null) {
            log.info("기존 파일 삭제 - URL: " + oldFile.getUrl());
            s3Service.deleteFile(oldFile.getUrl());
            mediaFileMapper.deleteByUrl(oldFile.getUrl());
        }

        // 3) 새 파일 S3 업로드
        String url = s3Service.upload(newFile, dir);
        log.info("새 파일 업로드 완료 - URL: " + url);

        // 4) DB 저장
        MediaFile mediaFile = MediaFile.of(accountId, refType, refId, url);
        mediaFileMapper.insertMediaFile(mediaFile);

        return url;
    }

    /**
     * 2. 다중 파일 업로드 (게시글/댓글/채팅/트레이너)
     * - 여러 파일을 순차적으로 업로드
     */
    private void uploadMultipleFiles(Long accountId, String refType, Long refId, 
                                      List<MultipartFile> files, String dir) {

        if (files == null || files.isEmpty()) {
            log.warn("업로드할 파일이 없습니다.");
            return;
        }

        log.info("다중 파일 업로드 시작 - refType: " + refType + ", refId: " + refId + ", 파일 개수: " + files.size());

        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                String url = s3Service.upload(file, dir);
                MediaFile mediaFile = MediaFile.of(accountId, refType, refId, url);
                mediaFileMapper.insertMediaFile(mediaFile);
                log.info("파일 업로드 완료 - URL: " + url);
            }
        }
    }

    /**
     * 3. 다중 파일 수정 (유지할 URL 리스트 + 새 파일)
     * - DB에 있지만 remainUrls에 없는 것 = 삭제 대상
     * - newFiles는 추가로 업로드
     */
    @Transactional
    public void syncMultipleFiles(Long accountId, String refType, Long refId, 
                                   List<String> remainUrls, List<MultipartFile> newFiles, 
                                   String dir) {

        log.info("다중 파일 동기화 시작 - refType: " + refType + ", refId: " + refId);

        // 1) DB에 저장된 기존 파일 목록 조회
        List<MediaFile> dbFiles = mediaFileMapper.findFiles(refType, refId);
        List<String> dbUrls = dbFiles.stream()
                .map(MediaFile::getUrl)
                .collect(Collectors.toList());

        // 2) 삭제 대상 계산 (DB에는 있지만 remainUrls에는 없는 것)
        List<String> deleteTargets = dbUrls.stream()
                .filter(url -> remainUrls == null || !remainUrls.contains(url))
                .collect(Collectors.toList());

        // 3) 삭제 실행
        for (String url : deleteTargets) {
            log.info("파일 삭제 - URL: " + url);
            s3Service.deleteFile(url);
            mediaFileMapper.deleteByUrl(url);
        }

        // 4) 신규 파일 업로드
        if (newFiles != null && !newFiles.isEmpty()) {
            for (MultipartFile file : newFiles) {
                if (!file.isEmpty()) {
                    String url = s3Service.upload(file, dir);
                    MediaFile mediaFile = MediaFile.of(accountId, refType, refId, url);
                    mediaFileMapper.insertMediaFile(mediaFile);
                    log.info("신규 파일 업로드 완료 - URL: " + url);
                }
            }
        }
    }

    /**
     * 4. 전체 삭제 (게시글/댓글/채팅방 삭제 시)
     * - 특정 refType + refId에 속한 모든 파일을 S3 + DB에서 삭제
     */
    private void deleteAllFiles(String refType, Long refId) {

        log.info("전체 파일 삭제 시작 - refType: " + refType + ", refId: " + refId);

        List<MediaFile> files = mediaFileMapper.findFiles(refType, refId);

        if (files.isEmpty()) {
            log.info("삭제할 파일이 없습니다.");
            return;
        }

        // S3에서 파일 삭제
        for (MediaFile file : files) {
            log.info("S3 파일 삭제 - URL: " + file.getUrl());
            s3Service.deleteFile(file.getUrl());
        }

        // DB에서 레코드 삭제
        mediaFileMapper.deleteByRef(refType, refId);
        log.info("DB 레코드 삭제 완료 - 삭제된 파일 수: " + files.size());
    }

    /**
     * 5. 단일 파일 삭제 (프로필 제거 등)
     * - 특정 accountId + refType + refId에 해당하는 파일 1개 삭제
     */
    @Transactional
    public void deleteSingleFile(Long accountId, String refType, Long refId) {

        log.info("단일 파일 삭제 시작 - accountId: " + accountId + ", refType: " + refType + ", refId: " + refId);

        MediaFile file = mediaFileMapper.findSingleFile(accountId, refType, refId);

        if (file == null) {
            log.warn("삭제할 파일을 찾을 수 없습니다.");
            return;
        }

        s3Service.deleteFile(file.getUrl());
        mediaFileMapper.deleteByUrl(file.getUrl());
        log.info("파일 삭제 완료 - URL: " + file.getUrl());
    }
    
    private void deleteFilesByMediaIds(Long accountId, String refType, Long refId, List<Long> mediaIds) {
        if (mediaIds == null || mediaIds.isEmpty()) {
            return;
        }

        // ✅ 입력값 normalize (공백/대소문자 안정화)
        String inType = (refType == null) ? null : refType.trim().toUpperCase();

        for (Long mediaId : mediaIds) {
            if (mediaId == null) continue;

            MediaFile file = mediaFileMapper.findByMediaId(mediaId);
            if (file == null) {
                log.warn("삭제 대상 파일을 찾을 수 없음 - mediaId=" + mediaId);
                continue;
            }

            // ✅ DB값 normalize (Oracle CHAR trailing space 대비)
            String dbType = (file.getRefType() == null) ? null : file.getRefType().trim().toUpperCase();

            // ✅ 소유/대상 검증: 남의 파일 삭제 방지
            boolean match =
                accountId != null && file.getAccountId() != null && accountId.equals(file.getAccountId()) &&
                inType != null && dbType != null && inType.equals(dbType) &&
                refId != null && file.getRefId() != null && refId.equals(file.getRefId());

            if (!match) {                
                log.warn("삭제 대상 불일치 - mediaId=" + mediaId);
                continue;
            }

            // ✅ 실제 삭제
            s3Service.deleteFile(file.getUrl());
            mediaFileMapper.deleteByMediaId(mediaId);

            log.info("부분 삭제 완료 - mediaId=" + mediaId + ", url=" + file.getUrl());
        }
    }
}
