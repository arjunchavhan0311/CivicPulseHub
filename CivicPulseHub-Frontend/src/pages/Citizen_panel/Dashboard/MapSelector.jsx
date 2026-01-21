import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom marker icon with better styling
const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function LocationMarker({ onSelect }) {
  const propTypes = {
    onSelect: "function",
  };
  const [position, setPosition] = useState(null);
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng);
      map.flyTo(e.latlng, 17);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={markerIcon}>
      <Popup>
        <div style={{
          fontFamily: "inter, sans-serif",
          padding: "0.5rem 0",
          fontSize: "0.9rem",
        }}>
          <strong>Selected Location</strong><br />
          Lat: {position.lat.toFixed(5)}<br />
          Lng: {position.lng.toFixed(5)}
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapSelector({ onLocationSelect }) {
  const propTypes = {
    onLocationSelect: "function",
  };
  return (
    <div style={{
      position: "relative",
      height: "450px",
      width: "100%",
      borderRadius: "16px",
      overflow: "hidden",
      background: "var(--page-bg)",
    }}>
      <MapContainer
        center={[20.5937, 78.9629]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationMarker onSelect={onLocationSelect} />
      </MapContainer>

      {/* Overlay Instructions */}
      <div style={{
        position: "absolute",
        top: "1rem",
        left: "1rem",
        background: "rgba(255, 255, 255, 0.95)",
        padding: "0.75rem 1rem",
        borderRadius: "12px",
        fontSize: "0.85rem",
        fontWeight: "600",
        color: "#333",
        backdropFilter: "blur(4px)",
        zIndex: 400,
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      }}>
        📍 Click on the map to select your location
      </div>

      <style>{`
        .leaflet-container {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}
