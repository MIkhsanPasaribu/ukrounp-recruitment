import { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface StatisticsData {
  totalApplications: number;
  statusCounts: Array<{ _id: string; count: number }>;
  facultyCounts: Array<{ _id: string; count: number }>;
  genderCounts: Array<{ _id: string; count: number }>;
  dailyApplications: Array<{ _id: string; count: number }>;
}

export default function AdminDashboard() {
  const [statistics, setStatistics] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('/api/admin/statistics');
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const data = await response.json();
        if (data.success) {
          setStatistics(data.statistics);
        } else {
          setError(data.message || 'Failed to fetch statistics');
        }
      } catch (err) {
        setError('Error fetching statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) return <div className="text-center py-10">Loading statistics...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!statistics) return <div className="text-center py-10">No statistics available</div>;

  // Prepare data for status chart
  const statusData = {
    labels: statistics.statusCounts.map(item => item._id || 'Under Review'),
    datasets: [
      {
        label: 'Applications by Status',
        data: statistics.statusCounts.map(item => item.count),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for faculty chart
  const facultyData = {
    labels: statistics.facultyCounts.map(item => item._id),
    datasets: [
      {
        label: 'Applications by Faculty',
        data: statistics.facultyCounts.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for gender chart
  const genderData = {
    labels: statistics.genderCounts.map(item => item._id),
    datasets: [
      {
        label: 'Applications by Gender',
        data: statistics.genderCounts.map(item => item.count),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for daily applications chart
  const dailyData = {
    labels: statistics.dailyApplications.map(item => item._id),
    datasets: [
      {
        label: 'Daily Applications',
        data: statistics.dailyApplications.map(item => item.count),
        fill: false,
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Applications</h3>
          <p className="text-3xl font-bold text-blue-600">{statistics.totalApplications}</p>
        </div>
        
        {/* Add more summary cards here if needed */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Applications by Status</h3>
          <div className="h-64">
            <Pie data={statusData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Applications by Faculty</h3>
          <div className="h-64">
            <Bar 
              data={facultyData} 
              options={{ 
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }} 
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Applications by Gender</h3>
          <div className="h-64">
            <Pie data={genderData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Daily Applications (Last 30 Days)</h3>
          <div className="h-64">
            <Line 
              data={dailyData} 
              options={{ 
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      precision: 0
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}