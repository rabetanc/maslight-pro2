import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Fix for default marker icons in Leaflet with Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapSelectorProps {
  lat: number;
  lon: number;
  onChange: (lat: number, lon: number) => void;
}

function LocationMarker({ lat, lon, onChange }: MapSelectorProps) {
  const map = useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  useEffect(() => {
    map.flyTo([lat, lon], map.getZoom());
  }, [lat, lon, map]);

  return <Marker position={[lat, lon]} />;
}

export default function MapSelector({ lat, lon, onChange }: MapSelectorProps) {
  return (
    <div className="h-[300px] w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner">
      <MapContainer
        center={[lat, lon]}
        zoom={6}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker lat={lat} lon={lon} onChange={onChange} />
      </MapContainer>
    </div>
  );
}
