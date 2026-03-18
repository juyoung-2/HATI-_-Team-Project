package org.hati.profile.controller;

import java.util.List;
import java.util.Map;

import org.hati.profile.service.ProfileService;
import org.hati.profile.vo.ProfileUpdateDTO;
import org.hati.trainer.vo.TrainerPassProductVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
public class ProfileApiController {
	
	@Autowired
	private ProfileService pservice;

    @PutMapping("/{accountId}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long accountId,
            @RequestBody ProfileUpdateDTO dto) {

    	dto.setAccountId(accountId);
    	
    	try {
            pservice.updateProfile(dto);
            return ResponseEntity.ok("프로필이 업데이트되었습니다.");
            
        } catch (IllegalArgumentException e) {
            // 입력값 검증 실패 (닉네임 형식 오류 등)
            return ResponseEntity.badRequest().body(e.getMessage());
            
        } catch (Exception e) {
            // 그 외 서버 오류
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body("서버 오류가 발생했습니다.");
        }
    }
    
    @PostMapping("/check/{nickname}/{handle}")
    public ResponseEntity<?> nicknameHandleCheck(
    		@PathVariable String nickname,
    		@PathVariable String handle){
    	
    	int nicknameHandleCheck = pservice.nicknameHandleCheck(nickname, handle);
    	if (nicknameHandleCheck == 1) {
    	    return ResponseEntity.status(HttpStatus.CONFLICT).body("이미 사용 중인 nickname + handle입니다.");
    	} else {
    	    return ResponseEntity.ok("사용 가능한 nickname + handle입니다.");
    	}
    }
    
    // 트레이너 이용권 정보 조회
    @GetMapping("/{accountId}/pass")
    public List<TrainerPassProductVO> getTrainerPassProduct(@PathVariable Long accountId){
    	return pservice.getTrainerPassProduct(accountId);
    }
    
    // 트레이너 이용권 가격 수정
    @PutMapping("/{productId}/updatePass")
    public ResponseEntity<Void> updatePass(
    		@PathVariable Long productId,
    		@RequestBody Map<String, Long> body){
    	
    	Long price = body.get("price");
    	pservice.updatePass(productId, price);
    	
    	return ResponseEntity.ok().build();
    }
    
    // 트레이너 이용권 삭제
    @DeleteMapping("/{productId}/deletePass")
    public ResponseEntity<Void> deletePass(
    		@PathVariable Long productId){
    	pservice.deletePass(productId);
    	
    	return ResponseEntity.ok().build();
    }
    
    // 트레이너 이용권 추가
    @PostMapping("/{accountId}/insertPass")
    public ResponseEntity<Void> insertPass(
    		@PathVariable Integer accountId,
    		@RequestBody TrainerPassProductVO tvo){
    	
    	tvo.setTrainerAccountId(accountId);
    	pservice.insertPass(tvo);
    	
    	return ResponseEntity.ok().build();
    }
    
}