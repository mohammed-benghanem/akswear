import { useEffect, useState } from "react";
import "./LoadingScreen.css";

export default function LoadingScreen({ onFinish }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // Keep it visible for 2 seconds for a premium feel
    const timer = setTimeout(() => {
      setFade(true);
      setTimeout(onFinish, 800); // 800ms fade transition
    }, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`loading-screen ${fade ? "fade-out" : ""}`}>
      <div className="loading-content">
        <div className="logo-container">
          <div className="glow-effect"></div>
          {/* Using the dark mode logo if the background is black, otherwise fallback to logo */}
          <picture>
            <source srcSet="/logo-dark.png" media="(prefers-color-scheme: dark)" />
            <img src="/logo.png" alt="AKS Wear" className="loading-logo" />
          </picture>
        </div>
        <div className="loading-bar-container">
          <div className="loading-bar"></div>
        </div>
      </div>
    </div>
  );
}
