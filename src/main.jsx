import { createRoot } from 'react-dom/client';
import App from './App';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './styles/main.css';
import './styles/homepage.css';
import './styles/pages.css';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// GSAP error handling
if (!gsap.fromTo) {
  console.error('GSAP failed to load. Animations will not run.');
}

// Render the app
const root = createRoot(document.getElementById('root'));
root.render(<App />);