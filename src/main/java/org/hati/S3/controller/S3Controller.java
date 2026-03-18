package org.hati.S3.controller;

import java.util.List;

import org.hati.S3.service.MediaFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * S3 파일 업로드/삭제 컨트롤러
 * 
 * 지원 파일 타입:
 * - 프로필 이미지 (단일)
 * - 배너 이미지 (단일)
 * - 사업자 등록증 (단일)
 * - 게시글 이미지 (다중)
 * - 댓글 이미지 (다중)
 * - 채팅 파일 (다중)
 * - 트레이너 자격증 (다중)
 */
@RestController
@RequestMapping("/upload")
public class S3Controller {

    private final MediaFileService mediaFileService;
    
    @Autowired
    public S3Controller(MediaFileService mediaFileService) {
        this.mediaFileService = mediaFileService;
    }

    /**
     * 프로필 이미지 업로드/수정
     * - 기존 프로필이 있으면 삭제 후 새로 업로드
     */
    @PostMapping("/profile/{accountId}")
    public ResponseEntity<String> uploadProfile(
            @PathVariable Long accountId,
            @RequestParam MultipartFile file) {

        mediaFileService.uploadProfileImage(accountId, file);
        return ResponseEntity.ok("프로필 업로드 완료");
    }

    /**
     * 배너 이미지 업로드/수정
     * - 기존 배너가 있으면 삭제 후 새로 업로드
     */
    @PostMapping("/banner/{accountId}")
    public ResponseEntity<String> uploadBanner(
            @PathVariable Long accountId,
            @RequestParam MultipartFile file) {

        mediaFileService.uploadBannerImage(accountId, file);
        return ResponseEntity.ok("배너 업로드 완료");
    }

    /**
     * 사업자 등록증 업로드/수정
     * - 기존 사업자등록증이 있으면 삭제 후 새로 업로드
     */
    @PostMapping("/biz/{accountId}")
    public ResponseEntity<String> uploadBizCert(
            @PathVariable Long accountId,
            @RequestParam MultipartFile file) {

        mediaFileService.uploadBizCert(accountId, file);
        return ResponseEntity.ok("사업자 등록증 업로드 완료");
    }

    /**
     * 게시글 이미지 여러 개 업로드
     * - 여러 이미지를 동시에 업로드
     */
    @PostMapping("/post/{postId}")
    public ResponseEntity<String> uploadPostImages(
            @PathVariable Long postId,
            @RequestParam Long accountId,
            @RequestParam List<MultipartFile> files) {

        mediaFileService.uploadPostImages(accountId, postId, files);
        return ResponseEntity.ok("게시글 이미지 업로드 완료");
    }

    /**
     * 게시글 이미지 수정
     * - 기존 이미지 중 유지할 것과 삭제할 것을 구분
     * - 새로운 이미지 추가
     * 
     * @param remainUrls 유지할 기존 이미지 URL 리스트 (optional)
     * @param newFiles 새로 추가할 이미지 파일 (optional)
     */
    @PutMapping("/post/{postId}")
    public ResponseEntity<String> updatePostImages(
            @PathVariable Long postId,
            @RequestParam Long accountId,
            @RequestParam(required = false) List<String> remainUrls,
            @RequestParam(required = false) List<MultipartFile> newFiles) {

        mediaFileService.syncPostImages(accountId, postId, remainUrls, newFiles);
        return ResponseEntity.ok("게시글 이미지 수정 완료");
    }

    /**
     * 댓글 이미지 업로드
     * - 여러 이미지를 동시에 업로드
     */
    @PostMapping("/comment/{commentId}")
    public ResponseEntity<String> uploadCommentImages(
            @PathVariable Long commentId,
            @RequestParam Long accountId,
            @RequestParam List<MultipartFile> files) {

        mediaFileService.uploadCommentImages(accountId, commentId, files);
        return ResponseEntity.ok("댓글 이미지 업로드 완료");
    }

    /**
     * 댓글 이미지 수정
     * - 기존 이미지 중 유지할 것과 삭제할 것을 구분
     * - 새로운 이미지 추가
     * 
     * @param remainUrls 유지할 기존 이미지 URL 리스트 (optional)
     * @param newFiles 새로 추가할 이미지 파일 (optional)
     */
    @PutMapping("/comment/{commentId}")
    public ResponseEntity<String> updateCommentImages(
            @PathVariable Long commentId,
            @RequestParam Long accountId,
            @RequestParam(required = false) List<String> remainUrls,
            @RequestParam(required = false) List<MultipartFile> newFiles) {

        mediaFileService.syncCommentImages(accountId, commentId, remainUrls, newFiles);
        return ResponseEntity.ok("댓글 이미지 수정 완료");
    }

    /**
     * 채팅 이미지 업로드
     * - 이미지, 문서 등 여러 파일 업로드 가능
     */
    @PostMapping("/chat_img/{chatId}")
    public ResponseEntity<String> uploadChatImages(
            @PathVariable Long chatId,
            @RequestParam Long accountId,
            @RequestParam List<MultipartFile> files) {

        mediaFileService.uploadChatFiles(accountId, chatId, files);
        return ResponseEntity.ok("채팅 이미지 업로드 완료");
    }

    /**
     * 채팅 이미지 수정
     * - 기존 파일 중 유지할 것과 삭제할 것을 구분
     * - 새로운 파일 추가
     * 
     * @param remainUrls 유지할 기존 파일 URL 리스트 (optional)
     * @param newFiles 새로 추가할 파일 (optional)
     */
    @PutMapping("/chat_img/{chatId}")
    public ResponseEntity<String> updateChatImages(
            @PathVariable Long chatId,
            @RequestParam Long accountId,
            @RequestParam(required = false) List<String> remainUrls,
            @RequestParam(required = false) List<MultipartFile> newFiles) {

        mediaFileService.syncChatFiles(accountId, chatId, remainUrls, newFiles);
        return ResponseEntity.ok("채팅 이미지 수정 완료");
    }
    
    /**
     * 채팅 파일 업로드
     * - 이미지, 문서 등 여러 파일 업로드 가능
     */
    @PostMapping("/chat_file/{chatId}")
    public ResponseEntity<String> uploadChatFiles(
            @PathVariable Long chatId,
            @RequestParam Long accountId,
            @RequestParam List<MultipartFile> files) {

        mediaFileService.uploadChatFiles(accountId, chatId, files);
        return ResponseEntity.ok("채팅 파일 업로드 완료");
    }

    /**
     * 채팅 파일 수정
     * - 기존 파일 중 유지할 것과 삭제할 것을 구분
     * - 새로운 파일 추가
     * 
     * @param remainUrls 유지할 기존 파일 URL 리스트 (optional)
     * @param newFiles 새로 추가할 파일 (optional)
     */
    @PutMapping("/chat_file/{chatId}")
    public ResponseEntity<String> updateChatFiles(
            @PathVariable Long chatId,
            @RequestParam Long accountId,
            @RequestParam(required = false) List<String> remainUrls,
            @RequestParam(required = false) List<MultipartFile> newFiles) {

        mediaFileService.syncChatFiles(accountId, chatId, remainUrls, newFiles);
        return ResponseEntity.ok("채팅 파일 수정 완료");
    }

    /**
     * 트레이너 자격증 업로드
     * - 여러 개의 자격증 이미지 업로드
     */
    @PostMapping("/trainer-cert/{trainerId}")
    public ResponseEntity<String> uploadTrainerCert(
            @PathVariable Long trainerId,
            @RequestParam List<MultipartFile> files) {

        mediaFileService.uploadTrainerCert(trainerId, files);
        return ResponseEntity.ok("자격증 업로드 완료");
    }

    /**
     * 트레이너 자격증 수정
     * - 기존 자격증 중 유지할 것과 삭제할 것을 구분
     * - 새로운 자격증 추가
     * 
     * @param remainUrls 유지할 기존 이미지 URL 리스트 (optional)
     * @param newFiles 새로 추가할 이미지 파일 (optional)
     */
    @PutMapping("/trainer-cert/{trainerId}")
    public ResponseEntity<String> updateTrainerCert(
            @PathVariable Long trainerId,
            @RequestParam Long accountId,
            @RequestParam(required = false) List<String> remainUrls,
            @RequestParam(required = false) List<MultipartFile> newFiles) {

        mediaFileService.syncTrainerCert(accountId, trainerId, remainUrls, newFiles);
        return ResponseEntity.ok("트레이너 자격증 수정 완료");
    }

    /**
     * 특정 ref의 모든 파일 삭제
     * - 게시글/댓글/채팅방 삭제 시 관련된 모든 이미지 삭제
     * 
     * @param refType POST, COMMENT, CHAT 등
     * @param refId 해당 ref의 ID
     */
    @DeleteMapping("/{refType}/{refId}")
    public ResponseEntity<String> deleteByRef(
            @PathVariable String refType,
            @PathVariable Long refId) {

        mediaFileService.deleteAllByRef(refType, refId);
        return ResponseEntity.ok("파일 삭제 완료");
    }
}
