package org.hati.post.vo;

import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostFeedDTO {

  // ===== 식별 =====
  private Long postId;

  // ===== 작성자(표시) =====
  private String writerDisplayName;
  private String writerHandle;
  private String writerProfileImageUrl;
  private String writerHatiCode;
  private String writerGender;

  // ✅ 작성자(권한 판별용) - post-more에서 수정/삭제 노출 판단
  private Long writerAccountId;
  

  // ===== 내용/시간(화면용) =====
  private String createdAtStr;
  private String content;
  private List<String> imageUrls;

  // ===== 카운트 =====
  private Integer likeCount;
  private Integer commentCount;
  private Integer viewCount;

  // ===== 내 상태/태그 =====
  private Integer bookmarked;   // 0/1
  private Integer liked;        // 0/1
  private List<String> tags;    // #태그
  private boolean pinned;
}