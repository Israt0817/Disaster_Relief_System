import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

const targetedRedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const MapViewCenter = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.setView(coords, 13);
    }
  }, [coords, map]);
  return null;
};

const LiveMap = () => {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const [highlightedMission, setHighlightedMission] = useState(null);

  useEffect(() => {
    // SECURITY GUARDRAIL: Allow BOTH admin and volunteer roles to access
    const role = localStorage.getItem('userRole');
    if (role !== 'admin' && role !== 'volunteer') {
      alert("Access Denied: Map services restricted to personnel.");
      navigate('/login');
      return;
    }

    // SAFELY parse coordinates if coming from admin dashboard link
    if (routerLocation.state?.targetMission) {
      setHighlightedMission(routerLocation.state.targetMission);
    }
  }, [routerLocation, navigate]);

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <MapContainer center={[23.8103, 90.4125]} zoom={7} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {highlightedMission?.lat && highlightedMission?.lng && (
          <>
            <MapViewCenter coords={[highlightedMission.lat, highlightedMission.lng]} />
            <Marker position={[highlightedMission.lat, highlightedMission.lng]} icon={targetedRedIcon}>
              <Popup>
                <div style={{ color: '#000' }}>
                  <b style={{ color: '#ef4444' }}>🔴 TARGETED DEPLOYMENT ZONE</b><br />
                  <strong>{highlightedMission.title}</strong><br />
                  <span>{highlightedMission.location}</span>
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default LiveMap;