import { useState, useEffect, useCallback } from 'react';
import { Mission, MissionProgress, Transaction, WorkLog, ApiResponse } from '../types';
import { api } from '../services/api';

export const useMissions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [missionProgress, setMissionProgress] = useState<MissionProgress[]>([]);
  const [currentMission, setCurrentMission] = useState<MissionProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available missions
  const fetchMissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse<Mission[]>>('/missions');
      if (response.data.success && response.data.data) {
        setMissions(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch missions');
      console.error('Error fetching missions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch user's mission progress
  const fetchMissionProgress = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get<ApiResponse<MissionProgress[]>>('/missions/progress');
      if (response.data.success && response.data.data) {
        setMissionProgress(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch mission progress');
      console.error('Error fetching mission progress:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start a mission
  const startMission = useCallback(async (missionId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post<ApiResponse<MissionProgress>>(`/missions/${missionId}/start`);
      if (response.data.success && response.data.data) {
        setCurrentMission(response.data.data);
        await fetchMissionProgress(); // Refresh progress
        return response.data.data;
      }
    } catch (err) {
      setError('Failed to start mission');
      console.error('Error starting mission:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [fetchMissionProgress]);

  // Get mission logs
  const getMissionLogs = useCallback(async (missionId: string): Promise<WorkLog[]> => {
    try {
      const response = await api.get<ApiResponse<WorkLog[]>>(`/missions/${missionId}/logs`);
      return response.data.success ? response.data.data || [] : [];
    } catch (err) {
      console.error('Error fetching mission logs:', err);
      return [];
    }
  }, []);

  // Get mission details by ID
  const getMissionById = useCallback((missionId: string): Mission | undefined => {
    return missions.find(m => m.id === missionId);
  }, [missions]);

  // Get progress for specific mission
  const getProgressByMissionId = useCallback((missionId: string): MissionProgress | undefined => {
    return missionProgress.find(p => p.missionId === missionId);
  }, [missionProgress]);

  // Calculate total impact
  const getTotalImpact = useCallback((): number => {
    return missionProgress
      .filter(p => p.status === 'completed')
      .reduce((total, progress) => {
        const mission = getMissionById(progress.missionId);
        return total + (mission?.impact || 0);
      }, 0);
  }, [missionProgress, getMissionById]);

  // Get completed missions count
  const getCompletedMissionsCount = useCallback((): number => {
    return missionProgress.filter(p => p.status === 'completed').length;
  }, [missionProgress]);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([fetchMissions(), fetchMissionProgress()]);
  }, [fetchMissions, fetchMissionProgress]);

  // Initialize data on mount
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    missions,
    missionProgress,
    currentMission,
    isLoading,
    error,
    fetchMissions,
    fetchMissionProgress,
    startMission,
    getMissionLogs,
    getMissionById,
    getProgressByMissionId,
    getTotalImpact,
    getCompletedMissionsCount,
    refreshData,
  };
};
