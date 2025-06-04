import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const ContractChart = ({ data = [] }) => {
  // Sample data if none provided
  const chartData = data.length > 0 ? data : [
    { month: 'Jan', contracts: 12, value: 450000 },
    { month: 'Feb', contracts: 19, value: 680000 },
    { month: 'Mar', contracts: 15, value: 520000 },
    { month: 'Apr', contracts: 25, value: 890000 },
    { month: 'May', contracts: 22, value: 750000 },
    { month: 'Jun', contracts: 28, value: 920000 },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip 
          formatter={(value, name) => {
            if (name === 'contracts') return [value, 'Contracts'];
            if (name === 'value') return [`$${value.toLocaleString()}`, 'Value'];
            return [value, name];
          }}
        />
        <Area 
          type="monotone" 
          dataKey="contracts" 
          stroke="#3B82F6" 
          fill="#93BBFC" 
          fillOpacity={0.6}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default ContractChart;