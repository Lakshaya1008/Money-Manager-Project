package in.bushansirgur.moneymanager.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import in.bushansirgur.moneymanager.config.FlexibleLocalDateTimeDeserializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ExpenseDTO {
    private Long id;
    private String name;
    private String icon;
    private String categoryName;
    private Long categoryId;
    private BigDecimal amount;

    @JsonDeserialize(using = FlexibleLocalDateTimeDeserializer.class)
    private LocalDateTime date;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
