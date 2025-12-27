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
        // Only set if we got a valid URL
        if (url && url.trim() !== '') {
          setImageUrl(url);
        } else {
          setImageUrl(null);
        }
      } catch (error) {
        // Silently fail - just don't set imageUrl, component will show default avatar
        console.warn('Portrait loading failed, using default avatar:', error);
        setImageUrl(null);
      } finally {
        setLoading(false);
      }
    };

    // Only load if we have a payNumber
    if (payNumber) {
      loadPortrait();
    } else {
      setImageUrl(null);
    }
  }, [payNumber]);

  return { imageUrl, loading };
};

