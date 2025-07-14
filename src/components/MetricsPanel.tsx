import React from 'react';
import { Gauge, Clock, Zap, TrendingUp, Target } from 'lucide-react';

interface MetricsPanelProps {
  metrics: {
    distance: number;
    duration: number;
    avgSpeed: number;
    currentSpeed: number;
  };
  isTracking: boolean;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics, isTracking }) => {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getSpeedColor = (speed: number) => {
    if (speed < 5) return 'text-blue-600 bg-blue-50';
    if (speed < 15) return 'text-green-600 bg-green-50';
    if (speed < 25) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getSpeedLabel = (speed: number) => {
    if (speed < 5) return 'Walking';
    if (speed < 15) return 'Jogging';
    if (speed < 25) return 'Running';
    return 'Sprinting';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <TrendingUp className="text-green-600" />
          Live Performance Metrics
        </h3>
        {isTracking && (
          <div className="flex items-center gap-2 text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Live Tracking</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Distance */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Target className="text-white" size={20} />
            </div>
            <span className="text-sm font-semibold text-blue-800">Distance Covered</span>
          </div>
          <div className="text-3xl font-bold text-blue-700 mb-1">
            {metrics.distance.toFixed(2)}
          </div>
          <div className="text-sm text-blue-600 font-medium">kilometers</div>
          <div className="mt-2 text-xs text-blue-500">
            {(metrics.distance * 1000).toFixed(0)} meters
          </div>
        </div>

        {/* Duration */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <Clock className="text-white" size={20} />
            </div>
            <span className="text-sm font-semibold text-green-800">Active Time</span>
          </div>
          <div className="text-3xl font-bold text-green-700 mb-1">
            {formatTime(metrics.duration)}
          </div>
          <div className="text-sm text-green-600 font-medium">duration</div>
          <div className="mt-2 text-xs text-green-500">
            {Math.floor(metrics.duration)} seconds total
          </div>
        </div>

        {/* Average Speed */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-600 rounded-lg">
              <Gauge className="text-white" size={20} />
            </div>
            <span className="text-sm font-semibold text-yellow-800">Average Speed</span>
          </div>
          <div className="text-3xl font-bold text-yellow-700 mb-1">
            {metrics.avgSpeed.toFixed(1)}
          </div>
          <div className="text-sm text-yellow-600 font-medium">km/h</div>
          <div className="mt-2 text-xs text-yellow-500">
            {(metrics.avgSpeed / 3.6).toFixed(1)} m/s
          </div>
        </div>

        {/* Current Speed */}
        <div className={`bg-gradient-to-br rounded-xl p-6 border ${getSpeedColor(metrics.currentSpeed)} border-opacity-30`}>
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2 rounded-lg ${metrics.currentSpeed < 5 ? 'bg-blue-600' : 
              metrics.currentSpeed < 15 ? 'bg-green-600' : 
              metrics.currentSpeed < 25 ? 'bg-yellow-600' : 'bg-red-600'}`}>
              <Zap className="text-white" size={20} />
            </div>
            <span className={`text-sm font-semibold ${metrics.currentSpeed < 5 ? 'text-blue-800' : 
              metrics.currentSpeed < 15 ? 'text-green-800' : 
              metrics.currentSpeed < 25 ? 'text-yellow-800' : 'text-red-800'}`}>
              Current Speed
            </span>
          </div>
          <div className={`text-3xl font-bold mb-1 ${metrics.currentSpeed < 5 ? 'text-blue-700' : 
            metrics.currentSpeed < 15 ? 'text-green-700' : 
            metrics.currentSpeed < 25 ? 'text-yellow-700' : 'text-red-700'}`}>
            {metrics.currentSpeed.toFixed(1)}
          </div>
          <div className={`text-sm font-medium ${metrics.currentSpeed < 5 ? 'text-blue-600' : 
            metrics.currentSpeed < 15 ? 'text-green-600' : 
            metrics.currentSpeed < 25 ? 'text-yellow-600' : 'text-red-600'}`}>
            km/h
          </div>
          <div className={`mt-2 text-xs ${metrics.currentSpeed < 5 ? 'text-blue-500' : 
            metrics.currentSpeed < 15 ? 'text-green-500' : 
            metrics.currentSpeed < 25 ? 'text-yellow-500' : 'text-red-500'}`}>
            {getSpeedLabel(metrics.currentSpeed)}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      {metrics.distance > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-800 mb-2">Session Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Calories (est.)</span>
              <div className="font-semibold text-gray-800">
                {Math.round(metrics.distance * 60)} kcal
              </div>
            </div>
            <div>
              <span className="text-gray-500">Pace</span>
              <div className="font-semibold text-gray-800">
                {metrics.avgSpeed > 0 ? (60 / metrics.avgSpeed).toFixed(1) : '0.0'} min/km
              </div>
            </div>
            <div>
              <span className="text-gray-500">Steps (est.)</span>
              <div className="font-semibold text-gray-800">
                {Math.round(metrics.distance * 1300)}
              </div>
            </div>
            <div>
              <span className="text-gray-500">Status</span>
              <div className="font-semibold text-gray-800">
                {isTracking ? 'Active' : 'Paused'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsPanel;