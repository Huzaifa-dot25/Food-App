import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface Coords {
  latitude:  number;
  longitude: number;
}

export function useLocation() {
  const [location, setLocation]   = useState<Coords | null>(null);
  const [error,    setError]      = useState<string | null>(null);
  const [loading,  setLoading]    = useState(false);

  const requestLocation = async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied. Please enable it in settings.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (e: any) {
      setError(e.message ?? 'Failed to get location');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { requestLocation(); }, []);

  return { location, error, loading, refresh: requestLocation };
}
