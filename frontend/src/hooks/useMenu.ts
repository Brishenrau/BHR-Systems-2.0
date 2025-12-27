import { useEffect, useState } from 'react';
import { menuService } from '../services/menu.service';
import type { MenuItem } from '../types/database.types';
import type { ApiError } from '../types/api.types';

export const useMenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMenu = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const menu = await menuService.getUserMenu();
        setMenuItems(menu);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to load menu');
        console.error('Failed to load menu:', err);
        // Even on error, set empty array so UI doesn't break
        setMenuItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  return { menuItems, loading, error };
};
