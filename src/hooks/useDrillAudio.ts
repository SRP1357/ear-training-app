import { useCallback, useEffect, useRef, useState } from 'react';
import { synth } from '../audio/synth';

/**
 * Manages drill autoplay + browser audio unlock.
 * First prompt waits for a user gesture (autoplay policy).
 */
export function useDrillAudio() {
  const [needsUnlock, setNeedsUnlock] = useState(true);
  const unlockedRef = useRef(false);

  useEffect(() => {
    return () => {
      synth.stopAll();
    };
  }, []);

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
