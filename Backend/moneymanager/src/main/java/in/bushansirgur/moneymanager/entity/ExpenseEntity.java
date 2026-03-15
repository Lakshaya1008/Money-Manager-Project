package in.bushansirgur.moneymanager.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "tbl_expenses")
public class ExpenseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String icon;
    private LocalDateTime date;
    private BigDecimal amount;

    @Column(updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // ROOT CAUSE FIX — second half of "only income downloaded" bug
    //
    // WAS: @ManyToOne  (no FetchType specified — defaults to EAGER)
    //
    // With spring.jpa.open-in-view=false (correctly set in application.properties),
    // the Hibernate session closes at the end of the service transaction.
    // EAGER associations are loaded inside the transaction via the JPQL JOIN FETCH —
    // but Hibernate 6 with EAGER + JOIN FETCH in the same query fires EXTRA per-row
    // SELECT queries for the EAGER association AFTER the JPQL returns, which is
    // outside the session boundary. This causes one of:
    //   a) LazyInitializationException — no session to load the association
    //   b) The query silently returning 0 rows due to the conflicting fetch strategy
    //
    // Either way, filterExpenses() either throws (causing the truncated file via
    // the inline-argument bug in ExcelController) or returns empty list (making the
    // Expenses sheet appear blank in the downloaded report.
    //
    // FIX: add FetchType.LAZY — consistent with IncomeEntity which already has this.
    // The JPQL LEFT JOIN FETCH in ExpenseRepository handles eager loading exactly
    // where it is needed (filter queries, dashboard queries) without N+1 selects.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private CategoryEntity category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "profile_id", nullable = false)
    private ProfileEntity profile;

    @PrePersist
    public void prePersist() {
        if (this.date == null) {
            this.date = LocalDateTime.now();
        }
    }
}