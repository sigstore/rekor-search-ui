import { useEffect } from 'react';
import { Observable, ReplaySubject } from 'rxjs';

export function useDestroyed$(): Observable<void> {
  const destroyed$$ = new ReplaySubject<void>();

  useEffect(() => {
    return () => {
      destroyed$$.next();
      destroyed$$.complete();
    };
  });

  return destroyed$$;
}