package org.hati.admin.center.controller;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.hati.admin.center.domain.CenterDetailDTO;
import org.hati.admin.center.domain.CenterListItemDTO;
import org.hati.admin.center.domain.CenterReviewDTO;
import org.hati.admin.center.domain.CenterRoomDTO;
import org.hati.admin.center.domain.CenterSearchRequest;
import org.hati.admin.center.domain.RoomEnvStatDTO;
import org.hati.admin.center.domain.RoomRealTimeDTO;
import org.hati.admin.center.service.AdminCenterService;
import org.hati.admin.user.domain.PageResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/centers")
public class AdminCenterController {

	private final AdminCenterService service;

    public AdminCenterController(AdminCenterService service) {
        this.service = service;
    }

    @GetMapping("/api")
    public PageResponse<CenterListItemDTO> centers(CenterSearchRequest req) {
        return service.getCenters(req);
    }

    @GetMapping("/api/{centerId}")
    public CenterDetailDTO centerDetail(@PathVariable Long centerId) {
        return service.getCenterDetail(centerId);
    }

    @GetMapping("/api/{centerId}/reviews")
    public List<CenterReviewDTO> centerReviews(@PathVariable Long centerId) {
        return service.getCenterReviews(centerId);
    }

    @GetMapping("/api/{centerId}/rooms")
    public List<CenterRoomDTO> centerRooms(@PathVariable Long centerId) {
        return service.getCenterRooms(centerId);
    }

    @GetMapping("/api/rooms/{roomId}/realtime")
    public RoomRealTimeDTO roomRealtime(@PathVariable Long roomId) {
        return service.getRoomRealtime(roomId);
    }

    @GetMapping("/api/rooms/{roomId}/env-stats")
    public List<RoomEnvStatDTO> roomEnvStats(@PathVariable Long roomId,
                                             @RequestParam String targetDate) {
        return service.getRoomEnvStats(roomId, targetDate);
    }
    
    @PostMapping("/api/{reviewId}/hide")
    public Map<String, Object> hide(@PathVariable long reviewId) {
        service.hide(reviewId);
        return Collections.singletonMap("ok", true);
    }
    
    @GetMapping("/api/reviews/{reviewId}")
    public CenterReviewDTO getCenterReview(@PathVariable long reviewId) {
        return service.getCenterReview(reviewId);
    }
}
