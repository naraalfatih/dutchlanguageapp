import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { hydrate } from './lib/store';
import './styles.css';

const root = createRoot(document.getElementById('root')!);

void hydrate().finally(() => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
