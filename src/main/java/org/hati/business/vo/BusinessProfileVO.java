package org.hati.business.vo;

import java.util.Date;

import org.springframework.format.annotation.DateTimeFormat;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BusinessProfileVO {

    private Long accountId;           // account_id (PK, FK)

    private String companyName;       // company_name
    @DateTimeFormat(pattern = "yyyy-MM-dd")
    private Date foundedDate;          // founded_date
    private String bizRegNo;           // biz_reg_no

    private String verificationStatus; // PENDING / APPROVED / REJECTED
    private Date verifiedAt;           // verified_at
}
