// mobile/components/MapLocationPicker.tsx
//
// Reusable full-screen map picker. Provider is configured via:
//   EXPO_PUBLIC_MAP_PROVIDER = "osm" (default) | "google"
//   EXPO_PUBLIC_GOOGLE_MAPS_API_KEY = <your key>  (only for "google")
//
// Usage:
//   <MapLocationPicker
//     visible={show}
//     title="Pick delivery address"      // optional, defaults to "Pick Location"
//     initialLat={lat}
//     initialLng={lng}
//     onConfirm={(label, lat, lng) => { ... }}
//     onClose={() => setShow(false)}
//   />
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { GOOGLE_MAPS_API_KEY, MAP_PROVIDER } from '../lib/mapConfig';

// ── Defaults ──────────────────────────────────────────────────────────────
const DEFAULT_LAT = 14.5995; // Manila
const DEFAULT_LNG = 120.9842;

// ── Map HTML builders ─────────────────────────────────────────────────────

function buildOsmHtml(lat: number, lng: number): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body, #map { width:100%; height:100%; }
  #hint {
    position:absolute; bottom:80px; left:50%; transform:translateX(-50%);
    background:rgba(0,0,0,0.6); color:#fff; padding:6px 14px;
    border-radius:20px; font-size:13px; z-index:1000; white-space:nowrap;
    pointer-events:none;
  }
</style>
</head>
<body>
<div id="map"></div>
<div id="hint">Drag the pin or tap to select</div>
<script>
  var map = L.map('map').setView([${lat}, ${lng}], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors', maxZoom: 19
  }).addTo(map);

  var marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);

  function send(latlng) {
    if (window.ReactNativeWebView)
      window.ReactNativeWebView.postMessage(JSON.stringify({ lat: latlng.lat, lng: latlng.lng }));
    document.getElementById('hint').style.display = 'none';
  }

  send(marker.getLatLng());
  marker.on('dragend', function(e) { send(e.target.getLatLng()); });
  map.on('click', function(e) { marker.setLatLng(e.latlng); map.panTo(e.latlng); send(e.latlng); });
</script>
</body>
</html>`;
}

function buildGoogleHtml(lat: number, lng: number, apiKey: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body, #map { width:100%; height:100%; }
  #hint {
    position:absolute; bottom:80px; left:50%; transform:translateX(-50%);
    background:rgba(0,0,0,0.6); color:#fff; padding:6px 14px;
    border-radius:20px; font-size:13px; z-index:1000; white-space:nowrap;
  }
</style>
</head>
<body>
<div id="map"></div>
<div id="hint">Drag the pin or tap to select</div>
<script>
  function initMap() {
    var pos = { lat: ${lat}, lng: ${lng} };
    var map = new google.maps.Map(document.getElementById('map'), {
      center: pos, zoom: 14,
      gestureHandling: 'greedy',
      fullscreenControl: false,
      streetViewControl: false,
      mapTypeControl: false,
    });
    var marker = new google.maps.Marker({ position: pos, map: map, draggable: true });

    function send(latlng) {
      if (window.ReactNativeWebView)
        window.ReactNativeWebView.postMessage(JSON.stringify({ lat: latlng.lat(), lng: latlng.lng() }));
      document.getElementById('hint').style.display = 'none';
    }

    send(marker.getPosition());
    marker.addListener('dragend', function(e) { send(e.latLng); });
    map.addListener('click', function(e) { marker.setPosition(e.latLng); map.panTo(e.latLng); send(e.latLng); });
  }
</script>
<script src="https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap" async defer></script>
</body>
</html>`;
}

// ── Reverse geocoding ─────────────────────────────────────────────────────

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  if (MAP_PROVIDER === 'google' && GOOGLE_MAPS_API_KEY) {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    const data = await res.json();
    const result = data.results?.[0];
    if (result) {
      // Extract city + country from address components
      const comps = result.address_components ?? [];
      const city = comps.find((c: any) =>
        c.types.includes('locality') || c.types.includes('administrative_area_level_2')
      )?.long_name ?? '';
      const country = comps.find((c: any) => c.types.includes('country'))?.long_name ?? '';
      return [city, country].filter(Boolean).join(', ') || result.formatted_address;
    }
    return '';
  }

  // OSM Nominatim (default)
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
    { headers: { 'Accept-Language': 'en', 'User-Agent': 'KoobstelApp/1.0' } }
  );
  const data = await res.json();
  const addr = data.address ?? {};
  const city = addr.city ?? addr.town ?? addr.village ?? addr.county ?? '';
  const country = addr.country ?? '';
  return [city, country].filter(Boolean).join(', ');
}

// ── Component ─────────────────────────────────────────────────────────────

type Props = {
  visible: boolean;
  title?: string;
  initialLat?: number;
  initialLng?: number;
  onConfirm: (location: string, lat: number, lng: number) => void;
  onClose: () => void;
};

export default function MapLocationPicker({
  visible,
  title = 'Pick Location',
  initialLat,
  initialLng,
  onConfirm,
  onClose,
}: Props) {
  const lat = initialLat ?? DEFAULT_LAT;
  const lng = initialLng ?? DEFAULT_LNG;

  const [pinCoords, setPinCoords] = useState({ lat, lng });
  const [geocoding, setGeocoding] = useState(false);
  const [preview, setPreview] = useState('');
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mapHtml = MAP_PROVIDER === 'google' && GOOGLE_MAPS_API_KEY
    ? buildGoogleHtml(lat, lng, GOOGLE_MAPS_API_KEY)
    : buildOsmHtml(lat, lng);

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const coords = JSON.parse(event.nativeEvent.data);
      setPinCoords(coords);
      setPreview('');
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
      geocodeTimer.current = setTimeout(async () => {
        setGeocoding(true);
        try {
          setPreview(await reverseGeocode(coords.lat, coords.lng));
        } finally {
          setGeocoding(false);
        }
      }, 800);
    } catch {}
  };

  const handleConfirm = async () => {
    const location = preview || (await (async () => {
      setGeocoding(true);
      try { return await reverseGeocode(pinCoords.lat, pinCoords.lng); }
      finally { setGeocoding(false); }
    })());
    onConfirm(location, pinCoords.lat, pinCoords.lng);
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={geocoding}>
            {geocoding
              ? <ActivityIndicator size="small" color="white" />
              : <Text style={styles.confirmText}>Confirm</Text>}
          </TouchableOpacity>
        </View>

        {/* Map */}
        <WebView
          style={styles.map}
          source={{ html: mapHtml }}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          scrollEnabled={false}
        />

        {/* Preview bar */}
        <View style={styles.previewBar}>
          <Text style={styles.previewIcon}>📍</Text>
          {geocoding
            ? <ActivityIndicator size="small" color="#6366f1" style={{ marginLeft: 8 }} />
            : <Text style={styles.previewText} numberOfLines={1}>
                {preview || 'Drag pin or tap map to select'}
              </Text>}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  cancelBtn: { minWidth: 60 },
  cancelText: { fontSize: 15, color: '#64748b' },
  title: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#0f172a' },
  confirmBtn: {
    minWidth: 60, alignItems: 'center',
    backgroundColor: '#6366f1', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  confirmText: { fontSize: 14, color: 'white', fontWeight: '700' },
  map: { flex: 1 },
  previewBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
  },
  previewIcon: { fontSize: 18 },
  previewText: { flex: 1, marginLeft: 8, fontSize: 14, color: '#0f172a', fontWeight: '500' },
});
