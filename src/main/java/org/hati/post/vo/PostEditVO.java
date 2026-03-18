package org.hati.post.vo;

import java.util.List;

public class PostEditVO {

    private Long postId;
    private String content;

    // ✅ write.jsp의 tagsRaw input에 그대로 채울 문자열
    // 예: "#헬스 #오운완"
    private String tagsRaw;

    // ✅ EDIT 모달용 기존 이미지 목록 (mediaId + url)
    private List<PostEditImageVO> images;

    public Long getPostId() { return postId; }
    public void setPostId(Long postId) { this.postId = postId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getTagsRaw() { return tagsRaw; }
    public void setTagsRaw(String tagsRaw) { this.tagsRaw = tagsRaw; }

    public List<PostEditImageVO> getImages() { return images; }
    public void setImages(List<PostEditImageVO> images) { this.images = images; }
}