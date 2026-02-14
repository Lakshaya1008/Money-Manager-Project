package in.bushansirgur.moneymanager.repository;

import in.bushansirgur.moneymanager.entity.IncomeEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface IncomeRepository extends JpaRepository<IncomeEntity, Long> {

    //select * from tbl_incomes where profile_id = ?1 order by date desc
    List<IncomeEntity> findByProfileIdOrderByDateDesc(Long profileId);

    //select * from tbl_incomes where profile_id = ?1 order by date desc limit 5
    @Query("SELECT i FROM IncomeEntity i LEFT JOIN FETCH i.category WHERE i.profile.id = :profileId ORDER BY i.date DESC LIMIT 5")
    List<IncomeEntity> findTop5ByProfileIdOrderByDateDesc(@Param("profileId") Long profileId);

    @Query("SELECT SUM(i.amount) FROM IncomeEntity i WHERE i.profile.id = :profileId")
    BigDecimal findTotalExpenseByProfileId(@Param("profileId") Long profileId);

    //select * from tbl_incomes where profile_id = ?1 and date between ?2 and ?3 and name like %?4%
    @Query("SELECT i FROM IncomeEntity i LEFT JOIN FETCH i.category WHERE i.profile.id = :profileId AND i.date BETWEEN :startDate AND :endDate AND LOWER(i.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<IncomeEntity> findByProfileIdAndDateBetweenAndNameContainingIgnoreCase(
            @Param("profileId") Long profileId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("keyword") String keyword,
            Sort sort
    );

    //select * from tbl_incomes where profile_id = ?1 and date between ?2 and ?3 with category fetch
    @Query("SELECT i FROM IncomeEntity i LEFT JOIN FETCH i.category WHERE i.profile.id = :profileId AND i.date BETWEEN :startDate AND :endDate")
    List<IncomeEntity> findByProfileIdAndDateBetween(@Param("profileId") Long profileId, @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
