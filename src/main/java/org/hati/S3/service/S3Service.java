package org.hati.S3.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;

@Service
public class S3Service {

    private final AmazonS3 amazonS3;

    @Value("${cloud.aws.s3.bucket}")
    private String bucket;
    
    @Autowired
    public S3Service(AmazonS3 amazonS3) {
        this.amazonS3 = amazonS3;
    }

    /**
     * S3에 파일 업로드
     * @param file 업로드할 파일
     * @param dir S3 디렉토리 (profile, banner, post 등)
     * @return S3 URL
     */
    public String upload(MultipartFile file, String dir) {
        try {
            // 고유 파일명 생성
            String fileName = dir + "/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

            // 메타데이터 설정
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());

            // S3 업로드
            amazonS3.putObject(bucket, fileName, file.getInputStream(), metadata);

            // URL 반환
            return amazonS3.getUrl(bucket, fileName).toString();

        } catch (IOException e) {
            throw new RuntimeException("S3 파일 업로드 실패", e);
        }
    }

    /**
     * S3에서 파일 삭제
     * @param fileUrl 삭제할 파일의 전체 URL
     */
    public void deleteFile(String fileUrl) {
        try {
            String key = extractKeyFromUrl(fileUrl);
            amazonS3.deleteObject(bucket, key);
        } catch (Exception e) {
            throw new RuntimeException("S3 파일 삭제 실패: " + fileUrl, e);
        }
    }

    /**
     * S3 URL에서 Key 추출
     * 예: https://bucket.s3.region.amazonaws.com/profile/uuid_file.jpg
     *     -> profile/uuid_file.jpg
     */
    private String extractKeyFromUrl(String fileUrl) {
        return fileUrl.substring(fileUrl.indexOf(".com/") + 5);
    }
}
