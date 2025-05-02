
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Zorg ervoor dat we een geldig root element hebben voor de Chrome extensie
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
