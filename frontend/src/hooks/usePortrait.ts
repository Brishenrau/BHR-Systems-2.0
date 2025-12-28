import { useState, useEffect } from 'react';
import { portraitService } from '../services/portrait.service';

// Simple in-memory cache to prevent duplicate requests
const portraitCache = new Map<string, string | null>();
const loadingPromises = new Map<string, Promise<string | null>>();

export const usePortrait = (payNumber: string | null | undefined) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPortrait = async () => {
      if (!payNumber) {
        setImageUrl(null);
        return;
      }

      // Check cache first
      if (portraitCache.has(payNumber)) {
        setImageUrl(portraitCache.get(payNumber) || null);
        return;
      }

      // Check if there's already a loading promise for this payNumber
      let loadPromise = loadingPromises.get(payNumber);
      
      if (!loadPromise) {
        // Create a new loading promise
        setLoading(true);
        loadPromise = (async () => {
          try {
            const url = await portraitService.getPortrait(payNumber);
            const finalUrl = url && url.trim() !== '' ? url : null;
            portraitCache.set(payNumber, finalUrl);
            return finalUrl;
          } catch (error) {
            console.warn('Portrait loading failed, using default avatar:', error);
            portraitCache.set(payNumber, null);
            return null;
          } finally {
            loadingPromises.delete(payNumber);
          }
        })();
        
        loadingPromises.set(payNumber, loadPromise);
      }

      // Wait for the promise (whether it's new or existing)
      const result = await loadPromise;
      setImageUrl(result);
      setLoading(false);
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

