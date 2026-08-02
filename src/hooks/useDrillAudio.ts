import { useCallback, useEffect, useRef, useState } from 'react';
import { synth } from '../audio/synth';

/**
 * Manages drill autoplay + browser audio unlock.
 * First gesture unlocks Web Audio; later drills reuse the running context.
 */
export function useDrillAudio() {
  const already = synth.isUnlocked();
  const [needsUnlock, setNeedsUnlock] = useState(!already);
  const unlockedRef = useRef(already);

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
