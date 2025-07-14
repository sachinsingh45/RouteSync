import React, { useRef, useEffect, useState } from 'react';
import { Map, Maximize2, Minimize2 } from 'lucide-react';

interface Position {
  lat: number;
  lng: number;
  timestamp: number;
}

interface RouteCanvasProps {
  route: Position[];
}

const RouteCanvas: React.FC<RouteCanvasProps> = ({ route }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      // Set canvas size with device pixel ratio for crisp rendering
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';

      // Clear canvas with gradient background
      const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      if (route.length === 0) {
        // Draw placeholder
        ctx.fillStyle = '#64748b';
        ctx.font = '16px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Start tracking to see your route', rect.width / 2, rect.height / 2);
        return;
      }

      // Calculate bounds with padding
      const lats = route.map(p => p.lat);
      const lngs = route.map(p => p.lng);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      const padding = 40;
      const width = rect.width - 2 * padding;
      const height = rect.height - 2 * padding;

      // Handle single point
      if (route.length === 1) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Draw current position
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Add pulsing effect
        const time = Date.now() * 0.003;
        const pulseRadius = 8 + Math.sin(time) * 4;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        return;
      }

      // Convert lat/lng to canvas coordinates
      const toCanvasCoords = (lat: number, lng: number) => {
        const latRange = maxLat - minLat || 0.001;
        const lngRange = maxLng - minLng || 0.001;
        
        const x = padding + ((lng - minLng) / lngRange) * width;
        const y = padding + ((maxLat - lat) / latRange) * height;
        return { x, y };
      };

      // Draw route path with gradient
      if (route.length > 1) {
        const routeGradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
        routeGradient.addColorStop(0, '#3b82f6');
        routeGradient.addColorStop(0.5, '#8b5cf6');
        routeGradient.addColorStop(1, '#10b981');
        
        ctx.strokeStyle = routeGradient;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(59, 130, 246, 0.3)';
        ctx.shadowBlur = 8;

        ctx.beginPath();
        const startCoords = toCanvasCoords(route[0].lat, route[0].lng);
        ctx.moveTo(startCoords.x, startCoords.y);

        for (let i = 1; i < route.length; i++) {
          const coords = toCanvasCoords(route[i].lat, route[i].lng);
          ctx.lineTo(coords.x, coords.y);
        }
        ctx.stroke();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Draw start point
        const startPoint = toCanvasCoords(route[0].lat, route[0].lng);
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(startPoint.x, startPoint.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Start point border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw end point with animation
        const endPoint = toCanvasCoords(route[route.length - 1].lat, route[route.length - 1].lng);
        const time = Date.now() * 0.005;
        const pulseSize = 6 + Math.sin(time) * 2;
        
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(endPoint.x, endPoint.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
        
        // End point border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw intermediate points
        ctx.fillStyle = '#3b82f6';
        for (let i = 1; i < route.length - 1; i++) {
          const coords = toCanvasCoords(route[i].lat, route[i].lng);
          ctx.beginPath();
          ctx.arc(coords.x, coords.y, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw legend
      const legendY = 25;
      ctx.font = '14px system-ui';
      ctx.textAlign = 'left';
      
      // Start legend
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(20, legendY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#374151';
      ctx.fillText('Start', 35, legendY + 5);

      // End legend
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(90, legendY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#374151';
      ctx.fillText('Current', 105, legendY + 5);

      // Route info
      if (route.length > 1) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px system-ui';
        ctx.textAlign = 'right';
        ctx.fillText(`${route.length} points tracked`, rect.width - 20, legendY + 3);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [route]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-100 transition-all duration-300 ${
      isFullscreen ? 'fixed inset-4 z-50' : 'mb-8'
    }`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Map className="text-blue-600" />
            Live Route Visualization
          </h3>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
        
        <div className="relative">
          <canvas
            ref={canvasRef}
            className={`w-full bg-gray-50 rounded-xl border-2 border-gray-200 transition-all duration-300 ${
              isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-80'
            }`}
          />
          
          {route.length > 0 && (
            <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="text-sm text-gray-600">
                <div className="font-semibold text-gray-800">Route Stats</div>
                <div>Points: {route.length}</div>
                <div>Duration: {Math.floor((Date.now() - route[0].timestamp) / 1000)}s</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteCanvas;