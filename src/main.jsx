import { createRoot } from 'react-dom/client';
import App from './App';
import gsap from 'gsap';
import './styles/main.css';

// GSAP error handling
if (!gsap.fromTo) {
  console.error('GSAP failed to load. Animations will not run.');
}

// Render the app
const root = createRoot(document.getElementById('root'));
root.render(<App />);