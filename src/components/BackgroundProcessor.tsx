import React from 'react';
import { Cpu, CheckCircle } from 'lucide-react';

interface BackgroundProcessorProps {
  tasks: string[];
}

const BackgroundProcessor: React.FC<BackgroundProcessorProps> = ({ tasks }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Cpu className="text-purple-600" />
        Background Processing
      </h3>
      
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-500">
            <CheckCircle size={16} />
            <span>All background tasks completed</span>
          </div>
        ) : (
          tasks.map((task, index) => (
            <div key={task} className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600">
                Processing {task}...
              </span>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <div className="font-medium mb-1">Background Tasks API Benefits:</div>
          <ul className="text-xs space-y-1 text-gray-500">
            <li>• Route optimization runs during idle time</li>
            <li>• UI remains responsive during processing</li>
            <li>• Efficient use of device resources</li>
            <li>• Automatic task scheduling</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BackgroundProcessor;