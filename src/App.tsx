import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, MapPin, Activity, Wifi, WifiOff, Clock } from 'lucide-react';
import RouteCanvas from './components/RouteCanvas';
import MetricsPanel from './components/MetricsPanel';
import RouteHistory from './components/RouteHistory';
import NetworkStatus from './components/NetworkStatus';

interface Position {
  lat: number;
  lng: number;
  timestamp: number;
}

interface RouteData {
  id: string;
  positions: Position[];
  distance: number;
  duration: number;
  avgSpeed: number;
  startTime: number;
  endTime: number;
}

function App() {
  const [isTracking, setIsTracking] = useState(false);
  const [currentRoute, setCurrentRoute] = useState<Position[]>([]);
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [metrics, setMetrics] = useState({
    distance: 0,
    duration: 0,
    avgSpeed: 0,
    currentSpeed: 0
  });
  const [networkInfo, setNetworkInfo] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const watchId = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const lastPosition = useRef<Position | null>(null);
  const metricsInterval = useRef<NodeJS.Timeout | null>(null);

  // Network Information API
  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      const updateNetworkInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
          type: connection.type
        });
      };
      
      updateNetworkInfo();
      connection.addEventListener('change', updateNetworkInfo);
      
      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
        window.removeEventListener('online', updateOnlineStatus);
        window.removeEventListener('offline', updateOnlineStatus);
      };
    }

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // Load saved routes from localStorage
  useEffect(() => {
    const savedRoutes = localStorage.getItem('fitnessRoutes');
    if (savedRoutes) {
      try {
        setRoutes(JSON.parse(savedRoutes));
      } catch (error) {
        console.error('Error loading saved routes:', error);
      }
    }
  }, []);

  // Save routes to localStorage
  useEffect(() => {
    if (routes.length > 0) {
      localStorage.setItem('fitnessRoutes', JSON.stringify(routes));
    }
  }, [routes]);

  // Geolocation API
  const startTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    if (!isOnline) {
      alert('You need an internet connection to start tracking.');
      return;
    }

    setIsTracking(true);
    startTime.current = Date.now();
    setCurrentRoute([]);
    setMetrics({ distance: 0, duration: 0, avgSpeed: 0, currentSpeed: 0 });
    lastPosition.current = null;

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000
    };

    // Start metrics update interval
    metricsInterval.current = setInterval(() => {
      if (startTime.current > 0) {
        const duration = (Date.now() - startTime.current) / 1000;
        setMetrics(prev => ({
          ...prev,
          duration,
          avgSpeed: prev.distance > 0 ? (prev.distance / duration) * 3600 : 0
        }));
      }
    }, 1000);

    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const newPos: Position = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: Date.now()
        };

        setCurrentPosition(newPos);
        
        setCurrentRoute(prev => {
          const updated = [...prev, newPos];
          
          // Calculate distance and speed
          if (lastPosition.current) {
            const distance = calculateDistance(lastPosition.current, newPos);
            const timeDiff = (newPos.timestamp - lastPosition.current.timestamp) / 1000;
            const speed = timeDiff > 0 ? (distance / timeDiff) * 3600 : 0;
            
            setMetrics(prevMetrics => ({
              ...prevMetrics,
              distance: prevMetrics.distance + distance,
              currentSpeed: speed
            }));
          }
          
          lastPosition.current = newPos;
          return updated;
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Error getting location: ';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied by user.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out.';
            break;
          default:
            errorMessage += 'Unknown error occurred.';
        }
        alert(errorMessage);
        setIsTracking(false);
      },
      options
    );
  };

  const pauseTracking = () => {
    setIsTracking(false);
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (metricsInterval.current) {
      clearInterval(metricsInterval.current);
      metricsInterval.current = null;
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (metricsInterval.current) {
      clearInterval(metricsInterval.current);
      metricsInterval.current = null;
    }

    if (currentRoute.length > 1) {
      const route: RouteData = {
        id: `route-${Date.now()}`,
        positions: currentRoute,
        distance: metrics.distance,
        duration: metrics.duration,
        avgSpeed: metrics.avgSpeed,
        startTime: startTime.current,
        endTime: Date.now()
      };

      setRoutes(prev => [route, ...prev]);
    }

    setCurrentRoute([]);
    setCurrentPosition(null);
    setMetrics({ distance: 0, duration: 0, avgSpeed: 0, currentSpeed: 0 });
    startTime.current = 0;
  };

  // Distance calculation using Haversine formula
  const calculateDistance = (pos1: Position, pos2: Position): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
    const dLng = (pos2.lng - pos1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const clearAllRoutes = () => {
    if (confirm('Are you sure you want to clear all route history?')) {
      setRoutes([]);
      localStorage.removeItem('fitnessRoutes');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-3">
            <Activity className="text-blue-600" size={40} />
            RouteSync
          </h1>
          <p className="text-gray-600 text-lg">Smart GPS tracking with real-time route synchronization</p>
        </div>

        {/* Network Status */}
        <NetworkStatus networkInfo={networkInfo} isOnline={isOnline} />

        {/* Control Panel */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Activity Control</h2>
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <Clock size={16} className="text-gray-500" />
              <span className="text-gray-600 font-medium">
                {isTracking ? 'Tracking Active' : 'Ready to Track'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            {!isTracking ? (
              <button
                onClick={startTracking}
                disabled={!isOnline}
                className="flex items-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg font-semibold"
              >
                <Play size={24} />
                Start Tracking
              </button>
            ) : (
              <>
                <button
                  onClick={pauseTracking}
                  className="flex items-center gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                >
                  <Pause size={24} />
                  Pause
                </button>
                <button
                  onClick={stopTracking}
                  className="flex items-center gap-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg font-semibold"
                >
                  <Square size={24} />
                  Stop & Save
                </button>
              </>
            )}
          </div>

          {!isOnline && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <WifiOff size={20} />
                <span className="font-medium">Offline Mode</span>
              </div>
              <p className="text-red-600 text-sm mt-1">
                Connect to the internet to start tracking your route
              </p>
            </div>
          )}
        </div>

        {/* Current Position */}
        {currentPosition && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="text-blue-600" />
              Current Location
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <span className="text-blue-700 font-medium">Latitude</span>
                <div className="text-2xl font-mono font-bold text-blue-800">
                  {currentPosition.lat.toFixed(6)}°
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <span className="text-green-700 font-medium">Longitude</span>
                <div className="text-2xl font-mono font-bold text-green-800">
                  {currentPosition.lng.toFixed(6)}°
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Route Canvas */}
        <RouteCanvas route={currentRoute} />

        {/* Metrics Panel */}
        <MetricsPanel metrics={metrics} isTracking={isTracking} />

        {/* Route History */}
        <RouteHistory routes={routes} onClearAll={clearAllRoutes} />
      </div>
    </div>
  );
}

export default App;