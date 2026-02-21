import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MonthlyProjection } from '../model/entities';
import { ProjectionService } from '../model/services';

interface ProjectionState {
  projections: MonthlyProjection[];
  history: MonthlyProjection[];
  negativeMonths: MonthlyProjection[];
  tightMonths: MonthlyProjection[];
  simulatorResult: {
    originalBalance: number;
    newBalance: number;
    difference: number;
    isStillPositive: boolean;
  } | null;
  isLoading: boolean;
}

interface ProjectionViewModel extends ProjectionState {
  simulate: (additionalExpense: number, month?: number, year?: number) => void;
  clearSimulation: () => void;
  refresh: () => void;
}

const ProjectionContext = createContext<ProjectionViewModel | null>(null);

export function ProjectionProvider({ children, userId }: { children: React.ReactNode; userId: string }) {
  const [state, setState] = useState<ProjectionState>({
    projections: [], history: [], negativeMonths: [], tightMonths: [], simulatorResult: null, isLoading: true,
  });

  const service = new ProjectionService();

  const loadData = useCallback(async () => {
    const [projections, history, negativeMonths, tightMonths] = await Promise.all([
      service.projectNextMonths(userId, 6),
      service.getLast12MonthsHistory(userId),
      service.getNegativeMonths(userId, 6),
      service.getTightMonths(userId, 6),
    ]);
    setState(prev => ({ ...prev, projections, history, negativeMonths, tightMonths, isLoading: false }));
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);

  const simulate = useCallback(async (additionalExpense: number, month?: number, year?: number) => {
    const now = new Date();
    const m = month ?? now.getMonth() + 1;
    const y = year ?? now.getFullYear();
    const result = await service.simulateExpense(userId, m, y, additionalExpense);
    setState(prev => ({ ...prev, simulatorResult: result }));
  }, [userId]);

  const clearSimulation = useCallback(() => {
    setState(prev => ({ ...prev, simulatorResult: null }));
  }, []);

  return (
    <ProjectionContext.Provider value={{ ...state, simulate, clearSimulation, refresh: loadData }}>
      {children}
    </ProjectionContext.Provider>
  );
}

export function useProjection() {
  const ctx = useContext(ProjectionContext);
  if (!ctx) throw new Error('useProjection must be used within ProjectionProvider');
  return ctx;
}
