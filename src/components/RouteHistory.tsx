import React, { useRef, useEffect, useState } from 'react';
import { History, MapPin, Clock, Gauge, Trash2, Calendar } from 'lucide-react';

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

interface RouteHistoryProps {
  routes: RouteData[];
  onClearAll: () => void;
}

const RouteHistory: React.FC<RouteHistoryProps> = ({ routes, onClearAll }) => {
  const [visibleRoutes, setVisibleRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const ROUTES_PER_LOAD = 5;

  // Intersection Observer API for infinite scroll
  useEffect(() => {
    const loadMore = () => {
      if (loading || !hasMore) return;
      
      setLoading(true);
      
      // Simulate network delay for better UX
      setTimeout(() => {
        const currentLength = visibleRoutes.length;
        const nextBatch = routes.slice(currentLength, currentLength + ROUTES_PER_LOAD);
        
        setVisibleRoutes(prev => [...prev, ...nextBatch]);
        setHasMore(currentLength + nextBatch.length < routes.length);
        setLoading(false);
      }, 300);
    };

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    if (loadMoreRef.current && hasMore) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [routes, visibleRoutes, loading, hasMore]);

  // Reset visible routes when routes change
  useEffect(() => {
    const initialRoutes = routes.slice(0, ROUTES_PER_LOAD);
    setVisibleRoutes(initialRoutes);
    setHasMore(routes.length > ROUTES_PER_LOAD);
  }, [routes]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const getActivityType = (avgSpeed: number) => {
    if (avgSpeed < 5) return { type: 'Walking', color: 'bg-blue-100 text-blue-800', icon: '🚶' };
    if (avgSpeed < 15) return { type: 'Jogging', color: 'bg-green-100 text-green-800', icon: '🏃' };
    if (avgSpeed < 25) return { type: 'Running', color: 'bg-yellow-100 text-yellow-800', icon: '🏃‍♂️' };
    return { type: 'Cycling', color: 'bg-purple-100 text-purple-800', icon: '🚴' };
  };

  const deleteRoute = (routeId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this route?')) {
      // This would typically call a parent function to update the routes
      console.log('Delete route:', routeId);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <History className="text-blue-600" />
          Activity History
        </h3>
        {routes.length > 0 && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        )}
      </div>
      
      {routes.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <MapPin size={32} className="text-gray-400" />
          </div>
          <h4 className="text-xl font-semibold text-gray-600 mb-2">No routes recorded yet</h4>
          <p className="text-gray-500 mb-6">Start tracking your activities to see them here</p>
          <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-blue-800 text-sm">
              💡 <strong>Tip:</strong> Your routes are automatically saved locally and will persist between sessions
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleRoutes.map((route, index) => {
            const activity = getActivityType(route.avgSpeed);
            
            return (
              <div 
                key={route.id} 
                className="border border-gray-200 rounded-xl p-6 hover:bg-gray-50 transition-all duration-200 hover:shadow-md cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{activity.icon}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${activity.color}`}>
                          {activity.type}
                        </span>
                        <span className="text-sm text-gray-500">
                          Route #{routes.length - index}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} />
                        {formatDate(route.startTime)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="text-right text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {route.positions.length} points
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteRoute(route.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-4">
                    <div className="p-2 bg-blue-600 rounded-lg">
                      <Gauge className="text-white" size={16} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-700">
                        {route.distance.toFixed(2)}
                      </div>
                      <div className="text-sm text-blue-600 font-medium">km</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-green-50 rounded-lg p-4">
                    <div className="p-2 bg-green-600 rounded-lg">
                      <Clock className="text-white" size={16} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-700">
                        {formatTime(route.duration)}
                      </div>
                      <div className="text-sm text-green-600 font-medium">time</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-yellow-50 rounded-lg p-4">
                    <div className="p-2 bg-yellow-600 rounded-lg">
                      <Gauge className="text-white" size={16} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-700">
                        {route.avgSpeed.toFixed(1)}
                      </div>
                      <div className="text-sm text-yellow-600 font-medium">km/h</div>
                    </div>
                  </div>
                </div>

                {/* Additional stats */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Calories</span>
                      <div className="font-semibold text-gray-800">
                        {Math.round(route.distance * 60)} kcal
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Pace</span>
                      <div className="font-semibold text-gray-800">
                        {route.avgSpeed > 0 ? (60 / route.avgSpeed).toFixed(1) : '0.0'} min/km
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Steps (est.)</span>
                      <div className="font-semibold text-gray-800">
                        {Math.round(route.distance * 1300)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration</span>
                      <div className="font-semibold text-gray-800">
                        {Math.floor(route.duration / 60)}m {Math.floor(route.duration % 60)}s
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Loading indicator and infinite scroll trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="text-center py-6">
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600 font-medium">Loading more activities...</span>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  Scroll down to load more activities
                </div>
              )}
            </div>
          )}
          
          {!hasMore && visibleRoutes.length > 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              You've reached the end of your activity history
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RouteHistory;