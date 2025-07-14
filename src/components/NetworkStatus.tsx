import React from 'react';
import { Wifi, WifiOff, Signal, Globe, Zap } from 'lucide-react';

interface NetworkStatusProps {
  networkInfo: any;
  isOnline: boolean;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ networkInfo, isOnline }) => {
  if (!isOnline) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-red-600 rounded-lg">
            <WifiOff className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-red-800">Offline Mode</h3>
            <p className="text-red-600 text-sm">No internet connection detected</p>
          </div>
        </div>
        <div className="bg-red-100 rounded-lg p-3">
          <p className="text-red-700 text-sm">
            📱 <strong>Limited functionality:</strong> GPS tracking is disabled. Connect to the internet to start recording your routes.
          </p>
        </div>
      </div>
    );
  }

  if (!networkInfo) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-600 rounded-lg">
            <Globe className="text-white" size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-yellow-800">Network Information</h3>
            <p className="text-yellow-600 text-sm">Network Information API not supported on this device</p>
          </div>
        </div>
      </div>
    );
  }

  const getConnectionQuality = () => {
    if (!networkInfo.downlink) return { quality: 'unknown', score: 0 };
    if (networkInfo.downlink >= 10) return { quality: 'excellent', score: 100 };
    if (networkInfo.downlink >= 5) return { quality: 'good', score: 75 };
    if (networkInfo.downlink >= 1) return { quality: 'fair', score: 50 };
    return { quality: 'poor', score: 25 };
  };

  const getQualityStyles = (quality: string) => {
    switch (quality) {
      case 'excellent': return {
        bg: 'bg-green-50 border-green-200',
        text: 'text-green-800',
        accent: 'bg-green-600',
        badge: 'bg-green-100 text-green-800'
      };
      case 'good': return {
        bg: 'bg-blue-50 border-blue-200',
        text: 'text-blue-800',
        accent: 'bg-blue-600',
        badge: 'bg-blue-100 text-blue-800'
      };
      case 'fair': return {
        bg: 'bg-yellow-50 border-yellow-200',
        text: 'text-yellow-800',
        accent: 'bg-yellow-600',
        badge: 'bg-yellow-100 text-yellow-800'
      };
      case 'poor': return {
        bg: 'bg-red-50 border-red-200',
        text: 'text-red-800',
        accent: 'bg-red-600',
        badge: 'bg-red-100 text-red-800'
      };
      default: return {
        bg: 'bg-gray-50 border-gray-200',
        text: 'text-gray-800',
        accent: 'bg-gray-600',
        badge: 'bg-gray-100 text-gray-800'
      };
    }
  };

  const { quality, score } = getConnectionQuality();
  const styles = getQualityStyles(quality);

  const getConnectionIcon = () => {
    if (networkInfo.effectiveType === '4g') return <Zap size={20} />;
    if (networkInfo.effectiveType === '3g') return <Signal size={20} />;
    return <Wifi size={20} />;
  };

  return (
    <div className={`border rounded-xl p-6 mb-8 ${styles.bg}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${styles.accent}`}>
            <div className="text-white">
              {getConnectionIcon()}
            </div>
          </div>
          <div>
            <h3 className={`font-semibold ${styles.text}`}>Network Connection</h3>
            <p className={`text-sm ${styles.text} opacity-75`}>
              {networkInfo.effectiveType?.toUpperCase() || 'Unknown'} • {quality.charAt(0).toUpperCase() + quality.slice(1)} Quality
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${styles.badge}`}>
            {quality.toUpperCase()}
          </div>
          {networkInfo.downlink && (
            <div className={`text-xs mt-1 ${styles.text} opacity-75`}>
              {networkInfo.downlink} Mbps
            </div>
          )}
        </div>
      </div>

      {/* Connection Quality Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-medium ${styles.text}`}>Connection Quality</span>
          <span className={`text-sm ${styles.text} opacity-75`}>{score}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              quality === 'excellent' ? 'bg-green-500' :
              quality === 'good' ? 'bg-blue-500' :
              quality === 'fair' ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${score}%` }}
          ></div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-white bg-opacity-50 rounded-lg p-3">
          <div className={`${styles.text} opacity-75 mb-1`}>Connection Type</div>
          <div className={`font-semibold ${styles.text}`}>
            {networkInfo.type || 'Unknown'}
          </div>
        </div>
        
        <div className="bg-white bg-opacity-50 rounded-lg p-3">
          <div className={`${styles.text} opacity-75 mb-1`}>Download Speed</div>
          <div className={`font-semibold ${styles.text}`}>
            {networkInfo.downlink ? `${networkInfo.downlink} Mbps` : 'Unknown'}
          </div>
        </div>
        
        <div className="bg-white bg-opacity-50 rounded-lg p-3">
          <div className={`${styles.text} opacity-75 mb-1`}>Latency</div>
          <div className={`font-semibold ${styles.text}`}>
            {networkInfo.rtt ? `${networkInfo.rtt}ms` : 'Unknown'}
          </div>
        </div>
        
        <div className="bg-white bg-opacity-50 rounded-lg p-3">
          <div className={`${styles.text} opacity-75 mb-1`}>Data Saver</div>
          <div className={`font-semibold ${styles.text}`}>
            {networkInfo.saveData ? 'Enabled' : 'Disabled'}
          </div>
        </div>
      </div>

      {/* Performance Tips */}
      <div className="mt-4 p-3 bg-white bg-opacity-50 rounded-lg">
        <div className={`text-sm ${styles.text}`}>
          <div className="font-medium mb-1">📡 Network Optimization Tips:</div>
          <ul className={`text-xs space-y-1 ${styles.text} opacity-75`}>
            {quality === 'poor' && (
              <>
                <li>• Consider moving to an area with better signal</li>
                <li>• GPS tracking may be less accurate on slow connections</li>
              </>
            )}
            {quality === 'fair' && (
              <>
                <li>• Route data will sync when connection improves</li>
                <li>• Background processing may be slower</li>
              </>
            )}
            {(quality === 'good' || quality === 'excellent') && (
              <>
                <li>• Optimal conditions for real-time GPS tracking</li>
                <li>• All features are fully functional</li>
              </>
            )}
            {networkInfo.saveData && (
              <li>• Data saver is enabled - some features may be limited</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NetworkStatus;