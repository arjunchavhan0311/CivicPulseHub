package com.example.demo.controller;

import com.example.demo.payload.MapLocationRequest;
import com.example.demo.entity.MapLocation;
import com.example.demo.repositories.MapLocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/map")
public class MapController {

    @Autowired
    private MapLocationRepository mapLocationRepo;

    @PostMapping("/save-location")
    public String saveLocation(@RequestBody MapLocationRequest request) {

        MapLocation location = new MapLocation();
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());

        // STORE ONLY IDS — NOT ENTITY OBJECTS
        location.setCitizenId(request.getCitizenId());
        location.setComplaintId(request.getComplaintId());

        mapLocationRepo.save(location);

        return "Location saved successfully with ID: " + location.getId();
    }
}
