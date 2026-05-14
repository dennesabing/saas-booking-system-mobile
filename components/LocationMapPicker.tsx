// mobile/components/LocationMapPicker.tsx
// Full-screen OSM map modal with a draggable pin.
// Reverse geocodes via Nominatim and returns a human-readable location string.
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

// Default centre: Manila
const DEFAULT_LAT = 14.5995;
const DEFAULT_LNG = 120.9842;

function buildMapHtml(lat: number, lng: number): string {
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
<div id="hint">Drag the pin to your location</div>
<script>
  var map = L.map('map', { zoomControl: true }).setView([${lat}, ${lng}], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  var marker = L.marker([${lat}, ${lng}], { draggable: true }).addTo(map);

  function sendCoords(latlng) {
    var msg = JSON.stringify({ lat: latlng.lat, lng: latlng.lng });
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(msg);
    }
  }

  // Send initial position
  sendCoords(marker.getLatLng());

  // Send on drag
  marker.on('dragend', function(e) {
    sendCoords(e.target.getLatLng());
    document.getElementById('hint').style.display = 'none';
  });

  // Tap on map moves the marker
  map.on('click', function(e) {
    marker.setLatLng(e.latlng);
    map.panTo(e.latlng);
    sendCoords(e.latlng);
    document.getElementById('hint').style.display = 'none';
  });
</script>
</body>
</html>`;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
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

type Props = {
  visible: boolean;
  initialLat?: number;
  initialLng?: number;
  onConfirm: (location: string, lat: number, lng: number) => void;
  onClose: () => void;
};

export default function LocationMapPicker({ visible, initialLat, initialLng, onConfirm, onClose }: Props) {
  const lat = initialLat ?? DEFAULT_LAT;
  const lng = initialLng ?? DEFAULT_LNG;

  const [pinCoords, setPinCoords] = useState<{ lat: number; lng: number }>({ lat, lng });
  const [geocoding, setGeocoding] = useState(false);
  const [preview, setPreview] = useState('');
  const geocodeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const coords = JSON.parse(event.nativeEvent.data);
      setPinCoords(coords);
      setPreview('');

      // Debounce geocoding — only fire 800ms after pin stops moving
      if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
      geocodeTimer.current = setTimeout(async () => {
        setGeocoding(true);
        try {
          const location = await reverseGeocode(coords.lat, coords.lng);
          setPreview(location);
        } finally {
          setGeocoding(false);
        }
      }, 800);
    } catch {}
  };

  const handleConfirm = async () => {
    if (preview) {
      onConfirm(preview, pinCoords.lat, pinCoords.lng);
      return;
    }
    setGeocoding(true);
    try {
      const location = await reverseGeocode(pinCoords.lat, pinCoords.lng);
      onConfirm(location, pinCoords.lat, pinCoords.lng);
    } finally {
      setGeocoding(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Pick Location</Text>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={geocoding}>
            {geocoding
              ? <ActivityIndicator size="small" color="white" />
              : <Text style={styles.confirmText}>Confirm</Text>}
          </TouchableOpacity>
        </View>

        {/* Map */}
        <WebView
          style={styles.map}
          source={{ html: buildMapHtml(lat, lng) }}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          originWhitelist={['*']}
          scrollEnabled={false}
        />

        {/* Location preview bar */}
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
    backgroundColor: '#fff',
  },
  cancelBtn: { minWidth: 60 },
  cancelText: { fontSize: 15, color: '#64748b' },
  title: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#0f172a' },
  confirmBtn: {
    minWidth: 60, alignItems: 'flex-end',
    backgroundColor: '#6366f1', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  confirmText: { fontSize: 14, color: 'white', fontWeight: '700' },
  map: { flex: 1 },
  previewBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: '#f1f5f9',
    backgroundColor: '#fff',
  },
  previewIcon: { fontSize: 18 },
  previewText: { flex: 1, marginLeft: 8, fontSize: 14, color: '#0f172a', fontWeight: '500' },
});
