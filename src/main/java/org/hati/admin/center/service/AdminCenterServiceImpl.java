package org.hati.admin.center.service;

import java.net.URI;
import java.util.List;
import java.util.Map;

import org.hati.admin.center.domain.CenterDetailDTO;
import org.hati.admin.center.domain.CenterListItemDTO;
import org.hati.admin.center.domain.CenterReviewDTO;
import org.hati.admin.center.domain.CenterRoomDTO;
import org.hati.admin.center.domain.CenterSearchRequest;
import org.hati.admin.center.domain.RoomEnvStatDTO;
import org.hati.admin.center.domain.RoomRealTimeDTO;
import org.hati.admin.mapper.AdminCenterMapper;
import org.hati.admin.user.domain.PageResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class AdminCenterServiceImpl implements AdminCenterService{
	
	private final AdminCenterMapper mapper;
    private final RestTemplate restTemplate = new RestTemplate();

    public AdminCenterServiceImpl(AdminCenterMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public PageResponse<CenterListItemDTO> getCenters(CenterSearchRequest req) {
        int total = mapper.countCenters(req);
        List<CenterListItemDTO> items = mapper.findCenters(req);
        return new PageResponse<>(items, req.getPage(), req.getSize(), total);
    }

    @Override
    public CenterDetailDTO getCenterDetail(Long centerId) {
        return mapper.findCenterDetail(centerId);
    }

    @Override
    public List<CenterReviewDTO> getCenterReviews(Long centerId) {
        return mapper.findCenterReviews(centerId);
    }

    @Override
    public List<CenterRoomDTO> getCenterRooms(Long centerId) {
        return mapper.findCenterRooms(centerId);
    }

    @Override
    public RoomRealTimeDTO getRoomRealtime(Long roomId) {
        @SuppressWarnings("unchecked")
        Map<String, Object> res = restTemplate.getForObject(
            URI.create("http://192.168.0.132:8080/api/realtime"), Map.class
        );

        RoomRealTimeDTO dto = new RoomRealTimeDTO();
        if (res != null) {
            dto.setRoomId(toLong(res.get("ROOM_ID")));
            dto.setTemperature(toDouble(res.get("TEMPERATURE")));
            dto.setHumidity(toDouble(res.get("HUMIDITY")));
            dto.setLightOn(toInt(res.get("LIGHT_ON")));
        }

        if (dto.getRoomId() == null || !dto.getRoomId().equals(roomId)) {
            dto.setRoomId(roomId);
        }
        return dto;
    }

    @Override
    public List<RoomEnvStatDTO> getRoomEnvStats(Long roomId, String targetDate) {
        return mapper.findRoomEnvStats(roomId, targetDate);
    }

    private Long toLong(Object v) {
        if (v == null) return null;
        return Long.valueOf(String.valueOf(v));
    }

    private Integer toInt(Object v) {
        if (v == null) return null;
        return Integer.valueOf(String.valueOf(v));
    }

    private Double toDouble(Object v) {
        if (v == null) return null;
        return Double.valueOf(String.valueOf(v));
    }
    
    @Override
    public void hide(Long reviewId) {
    	mapper.hide(reviewId);
    }
    
    @Override
    public CenterReviewDTO getCenterReview(long reviewId) {
        CenterReviewDTO dto = mapper.selectCenterReviewById(reviewId);
        if (dto == null) {
            throw new IllegalArgumentException("시설 리뷰를 찾을 수 없습니다. reviewId=" + reviewId);
        }
        return dto;
    }
}
