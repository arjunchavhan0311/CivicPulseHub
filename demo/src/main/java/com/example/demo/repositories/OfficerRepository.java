package com.example.demo.repositories;

import com.example.demo.entity.Officer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OfficerRepository extends JpaRepository<Officer, Long> {

    // Find officer by email
    Officer findByEmail(String email);
    
}
