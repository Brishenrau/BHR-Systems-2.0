import { useEffect, useState } from 'react';
import { menuService } from '../services/menu.service';
import type { BHR_MODULCODE } from '../types/database.types';
import type { ApiError } from '../types/api.types';

export const useModules = () => {
  const [modules, setModules] = useState<BHR_MODULCODE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModules = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const modulesData = await menuService.getUserModules();
        setModules(modulesData);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to load modules');
        console.error('Failed to load modules:', err);
        setModules([]);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

  return { modules, loading, error };
};

