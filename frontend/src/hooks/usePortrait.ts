import { useState, useEffect } from 'react';
import { portraitService } from '../services/portrait.service';

export const usePortrait = (payNumber: string | null | undefined) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPortrait = async () => {
      if (!payNumber) {
        setImageUrl(null);
        return;
      }

      try {
        setLoading(true);
        const url = await portraitService.getPortrait(payNumber);
        setImageUrl(url);
      } catch (error) {
        console.error('Failed to load portrait:', error);
        setImageUrl(null);
      } finally {
        setLoading(false);
      }
    };

    loadPortrait();
  }, [payNumber]);

  return { imageUrl, loading };
};

