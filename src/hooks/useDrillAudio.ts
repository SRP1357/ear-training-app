import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { synth } from '../audio/synth';

/**
 * Manages drill autoplay + web audio unlock.
 * On web, first prompt waits for a user gesture (browser autoplay policy).
 */
export function useDrillAudio() {
  const [needsUnlock, setNeedsUnlock] = useState(Platform.OS === 'web');
  const unlockedRef = useRef(Platform.OS !== 'web');

  useFocusEffect(
    useCallback(() => {
      return () => {
        synth.stopAll();
      };
    }, []),
  );

  const unlock = useCallback(async () => {
    await synth.unlock();
    unlockedRef.current = true;
    setNeedsUnlock(false);
  }, []);

  const canAutoplay = useCallback(() => unlockedRef.current, []);

  return {
    needsUnlock,
    unlock,
    canAutoplay,
    stopAll: () => synth.stopAll(),
  };
}
