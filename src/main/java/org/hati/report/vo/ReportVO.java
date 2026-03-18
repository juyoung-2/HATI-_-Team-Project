package org.hati.report.vo;

import java.util.Date;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportVO {
    private Long reportId;
    private Long reporterAccountId;
    private Long targetAccountId;
    private String targetType;
    private Long targetId;
    private String content;
    private Integer status;
    private String replyContent;
    private Long handledBy;
    private Date handledAt;
    private Date createdAt;
}