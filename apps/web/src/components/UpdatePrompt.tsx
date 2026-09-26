import { useRegisterSW } from 'virtual:pwa-register/react';

/** Offers to reload when a new version of the app (and its content) is available. */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({ immediate: true });

  if (!needRefresh) return null;
  return (
    <div className="toast row" role="status" style={{ gap: 12 }}>
      <span>A new version is ready.</span>
      <button type="button" className="btn small primary" onClick={() => void updateServiceWorker(true)}>
        Update
      </button>
      <button type="button" className="btn small ghost" onClick={() => setNeedRefresh(false)} style={{ color: 'inherit' }}>
        Later
      </button>
    </div>
  );
}
