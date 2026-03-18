package org.hati.report.vo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReportCreateRequestVO {
    private Long targetAccountId;
    private String targetType;
    private Long targetId;
    private String content;
}