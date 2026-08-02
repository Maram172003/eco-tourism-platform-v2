export const GOVERNORATE_COORDS: Record<string, { lat: number; lng: number }> = {
  "Tunis":          { lat: 36.8065, lng: 10.1815 },
  "Ariana":         { lat: 36.8665, lng: 10.1647 },
  "Ben Arous":      { lat: 36.7533, lng: 10.2283 },
  "Manouba":        { lat: 36.8042, lng: 10.0833 },
  "Nabeul":         { lat: 36.4536, lng: 10.7350 },
  "Sousse":         { lat: 35.8281, lng: 10.6403 },
  "Monastir":       { lat: 35.7647, lng: 10.8117 },
  "Mahdia":         { lat: 35.5000, lng: 11.0667 },
  "Sfax":           { lat: 34.7406, lng: 10.7603 },
  "Médenine":       { lat: 33.3547, lng: 10.5053 },
  "Bizerte":        { lat: 37.2746, lng: 9.8733 },
  "Béja":           { lat: 36.7256, lng: 9.1847 },
  "Jendouba":       { lat: 36.5000, lng: 8.7833 },
  "Le Kef":         { lat: 35.9167, lng: 8.7167 },
  "Siliana":        { lat: 35.9167, lng: 9.4833 },
  "Zaghouan":       { lat: 36.4000, lng: 10.1500 },
  "Kairouan":       { lat: 35.6781, lng: 10.0994 },
  "Kasserine":      { lat: 35.1667, lng: 8.8333 },
  "Sidi Bouzid":    { lat: 34.7406, lng: 9.4839 },
  "Gabès":          { lat: 33.8815, lng: 10.0982 },
  "Gafsa":          { lat: 34.4311, lng: 8.7756 },
  "Tozeur":         { lat: 33.9197, lng: 8.1333 },
  "Kébili":         { lat: 33.7000, lng: 8.9667 },
  "Tataouine":      { lat: 32.9297, lng: 10.4514 },
};

/** Liste unique des régions tunisiennes (utilisée partout) */
export const TUNISIA_REGIONS = Object.keys(GOVERNORATE_COORDS);
