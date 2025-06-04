import React from 'react';
import { format } from 'date-fns';
import { 
  FileText, 
  Search, 
  Send, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const RecentActivity = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'search':
        return <Search className="text-blue-600" size={20} />;
      case 'application':
        return <Send className="text-green-600" size={20} />;
      case 'contract':
        return <FileText className="text-purple-600" size={20} />;
      case 'success':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'alert':
        return <AlertCircle className="text-yellow-600" size={20} />;
      default:
        return <FileText className="text-gray-600" size={20} />;
    }
  };

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No recent activity
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start gap-3">
          <div className="p-2 bg-gray-100 rounded-lg">
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
            <p className="text-xs text-gray-500">
              {format(new Date(activity.timestamp), 'MMM dd, HH:mm')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentActivity;