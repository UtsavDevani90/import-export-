import { useState, useEffect } from 'react';
import { cmsService } from '../services/api';

export interface Stat {
  id: string;
  key: string;
  label: string;
  value: string;
  icon?: string;
  updated_at: string;
}

export interface UseStatsReturn {
  stats: Record<string, string>;
  statsArray: Stat[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Custom hook to fetch homepage statistics from cms_stats table
 * Returns both array format and key-value map for easy access
 *
 * Usage:
 *   const { stats, loading, error } = useStats();
 *   // Access by key: stats.clients, stats.countries, stats.years
 *   // Or array: statsArray[0].value, statsArray[0].label
 */
export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<Record<string, string>>({});
  const [statsArray, setStatsArray] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await cmsService.getStats();
      
      if (response.data?.data) {
        const data = response.data.data;
        const statsMap: Record<string, string> = {};
        
        // Build key-value map from the rows array
        if (Array.isArray(data.rows)) {
          data.rows.forEach((stat: Stat) => {
            statsMap[stat.key] = stat.value;
          });
          setStatsArray(data.rows);
        }
        
        // Use the map if provided, otherwise build from rows
        if (data.map && typeof data.map === 'object') {
          // Extract values from the map structure {key: {label, value}}
          Object.entries(data.map).forEach(([key, val]: [string, any]) => {
            if (val && val.value) {
              statsMap[key] = val.value;
            }
          });
        }
        
        setStats(statsMap);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statistics';
      setError(errorMessage);
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    statsArray,
    loading,
    error,
    refetch: fetchStats,
  };
}
