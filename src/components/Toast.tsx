import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react';

/** Returns [show, <Toast/>]. show(message) displays a status line for ~2.8s. */
export type ShowToast = (msg: string) => void;

export function useToast(): [ShowToast, ReactElement] {
  const [state, setState] = useState({ msg: '', on: false });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((msg: string) => {
    clearTimeout(timer.current);
    setState({ msg, on: true });
    timer.current = setTimeout(() => setState((s) => ({ ...s, on: false })), 2800);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const node = (
    <div className={'toast' + (state.on ? ' on' : '')} role="status" aria-live="polite">
      {state.msg}
    </div>
  );
  return [show, node];
}
