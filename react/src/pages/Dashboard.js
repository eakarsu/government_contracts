import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  FileText, 
  Search, 
  Clock,
  ArrowRight
} from 'lucide-react';
import contractService from '../services/contractService';
import formService from '../services/formService';
import StatsCard from '../components/dashboard/StatsCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import ContractChart from '../components/dashboard/ContractChart';

const Dashboard = () => {
  const { data: stats, isLoading: statsLoading } = useQuery(
    'dashboardStats',
    () => contractService.getDashboardStats()
  );

  const { data: recentApplications } = useQuery(
    'recentApplications',
    () => formService.getApplications({ limit: 5 })
  );

  const { data: savedSearches } = useQuery(
    'recentSearches',
    () => contractService.getSavedSearches({ limit: 5 })
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Active Contracts"
          value={stats?.activeContracts || 0}
          icon={FileText}
          trend={stats?.contractsTrend}
          loading={statsLoading}
        />
        <StatsCard
          title="Saved Searches"
          value={stats?.savedSearches || 0}
          icon={Search}
          loading={statsLoading}
        />
        <StatsCard
          title="Applications"
          value={stats?.applications || 0}
          icon={TrendingUp}
          trend={stats?.applicationsTrend}
          loading={statsLoading}
        />
        <StatsCard
          title="Success Rate"
          value={`${stats?.successRate || 0}%`}
          icon={Clock}
          loading={statsLoading}
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Contract Opportunities</h2>
          <ContractChart data={stats?.chartData} />
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <RecentActivity activities={stats?.recentActivity} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/search"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Search Contracts</h3>
              <p className="text-gray-600">Find new opportunities</p>
            </div>
            <ArrowRight className="text-blue-600" />
          </div>
        </Link>

        <Link
          to="/saved-searches"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Saved Searches</h3>
              <p className="text-gray-600">View your saved searches</p>
            </div>
            <ArrowRight className="text-blue-600" />
          </div>
        </Link>

        <Link
          to="/applications"
          className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Applications</h3>
              <p className="text-gray-600">Track your submissions</p>
            </div>
            <ArrowRight className="text-blue-600" />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;