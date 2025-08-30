import Head from 'next/head';
import DarlingChart from '../components/DarlingChart';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const canvas = document.getElementById('pixelCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let width, height;
    let pixels = [];
    let animationStartTime = Date.now();
    let animationId;
    
    // Configurações
    const PIXEL_SIZE = 2;
    const GRID_GAP = 8;
    const CELL_SIZE = PIXEL_SIZE + GRID_GAP;
    
    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initPixels();
    }
    
    function initPixels() {
      pixels = [];
      const cols = Math.ceil(width / CELL_SIZE);
      const rows = Math.ceil(height / CELL_SIZE);
      
      const centerX = width / 2;
      const centerY = height / 2;
      const maxDistance = Math.hypot(centerX, centerY);
      
      // Calculate the glow zone height (200px from bottom)
      const glowZoneHeight = 200;
      const glowZoneStart = height - glowZoneHeight;
      
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const pixelX = x * CELL_SIZE;
          const pixelY = y * CELL_SIZE;
          
          const distanceFromCenter = Math.hypot(pixelX - centerX, pixelY - centerY);
          
          // Calculate fade factor based on distance from glow zone
          let fadeFactor = 1;
          const fadeStartDistance = 300; // Start fading 300px before glow zone
          
          if (pixelY > glowZoneStart - fadeStartDistance) {
            if (pixelY <= glowZoneStart) {
              // Above glow zone - gradual fade over larger distance
              const distanceFromGlow = glowZoneStart - pixelY;
              fadeFactor = Math.pow(distanceFromGlow / fadeStartDistance, 0.5); // More aggressive fade curve
            } else {
              // Inside glow zone - fade to completely invisible only at the very bottom
              const depthIntoGlow = pixelY - glowZoneStart;
              const fadeProgress = depthIntoGlow / glowZoneHeight;
              fadeFactor = Math.max(0, 1 - fadeProgress * 1.2); // Completely invisible only near bottom
            }
          }
          
          pixels.push({
            x: pixelX,
            y: pixelY,
            opacity: 0,
            targetOpacity: 0,
            isActive: false,
            speed: 0.02 + Math.random() * 0.03,
            entryDelay: (distanceFromCenter / maxDistance) * 1000,
            hasEntered: false,
            timeOffset: Math.random() * Math.PI * 2,
            fadeFactor: fadeFactor
          });
        }
      }
      
      animationStartTime = Date.now();
    }
    
    const MIN_ACTIVE_PIXELS = 60;
    const MAX_ACTIVE_PIXELS = 120;
    let targetActivePixels = MIN_ACTIVE_PIXELS + Math.random() * (MAX_ACTIVE_PIXELS - MIN_ACTIVE_PIXELS);
    
    function animate() {
      ctx.clearRect(0, 0, width, height);
      
      const currentTime = Date.now();
      const timeSinceStart = currentTime - animationStartTime;
      
      let activeCount = pixels.filter(p => p.isActive).length;
      
      if (Math.random() < 0.005) {
        targetActivePixels = MIN_ACTIVE_PIXELS + Math.random() * (MAX_ACTIVE_PIXELS - MIN_ACTIVE_PIXELS);
      }
      
      if (activeCount < targetActivePixels) {
        const inactivePixels = pixels.filter(p => !p.isActive && p.hasEntered);
        if (inactivePixels.length > 0) {
          const toActivate = Math.min(2, targetActivePixels - activeCount);
          for (let i = 0; i < toActivate && i < inactivePixels.length; i++) {
            const randomPixel = inactivePixels[Math.floor(Math.random() * inactivePixels.length)];
            randomPixel.isActive = true;
            randomPixel.targetOpacity = 0.4 + Math.random() * 0.6;
          }
        }
      } else if (activeCount > targetActivePixels) {
        const activePixels = pixels.filter(p => p.isActive);
        const toDeactivate = Math.min(2, activeCount - targetActivePixels);
        for (let i = 0; i < toDeactivate && i < activePixels.length; i++) {
          const randomPixel = activePixels[Math.floor(Math.random() * activePixels.length)];
          randomPixel.isActive = false;
          randomPixel.targetOpacity = 0.04;
        }
      }
      
      pixels.forEach(pixel => {
        if (!pixel.hasEntered && timeSinceStart > pixel.entryDelay) {
          pixel.hasEntered = true;
          pixel.targetOpacity = 0.6 + Math.random() * 0.4;
          setTimeout(() => {
            pixel.targetOpacity = 0.04;
          }, 30 + Math.random() * 70);
        }
        
        if (pixel.hasEntered) {
          pixel.opacity += (pixel.targetOpacity - pixel.opacity) * 0.1;
          
          if (pixel.opacity > 0.01) {
            const intensity = pixel.opacity * pixel.fadeFactor;
            ctx.fillStyle = `rgba(49, 99, 223, ${intensity})`;
            
            ctx.fillRect(pixel.x, pixel.y, PIXEL_SIZE, PIXEL_SIZE);
            
            if (pixel.opacity > 0.5) {
              ctx.shadowBlur = 4;
              ctx.shadowColor = `rgba(49, 99, 223, ${intensity * 0.5})`;
              ctx.fillRect(pixel.x, pixel.y, PIXEL_SIZE, PIXEL_SIZE);
              ctx.shadowBlur = 0;
            }
          } else if (pixel.hasEntered) {
            // Draw dim pixels when not active, faded based on glow proximity
            const dimOpacity = 0.04 * pixel.fadeFactor;
            ctx.fillStyle = `rgba(49, 99, 223, ${dimOpacity})`;
            ctx.fillRect(pixel.x, pixel.y, PIXEL_SIZE, PIXEL_SIZE);
          }
        }
      });
      
      animationId = requestAnimationFrame(animate);
    }
    
    resize();
    animate();
    
    const handleResize = () => resize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return (
    <>
      <Head>
        <title>My Portfolio - Developer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <div className="pixel-bg">
        <canvas id="pixelCanvas"></canvas>
      </div>
      
      <div className="container">
        <div className="profile-section">
          <div className="profile-background-box">
            <div className="glass-edge"></div>
            <div className="chromatic-aberration"></div>
            <div className="profile-content">
              <div className="profile-image">
                <img src="https://via.placeholder.com/150" alt="Foto de perfil" id="profile-img" />
              </div>
              <h1>Your Name</h1>
              <p className="intro-text">I create products and web solutions</p>
              <div className="social-links">
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="GitHub">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="projects-section">
          <div className="projects-grid">
            <DarlingChart />

            <div className="project-card">
              <div className="project-logo">
                <img src="https://via.placeholder.com/40x40/6c757d/ffffff?text=🚀" alt="Projeto 2" />
              </div>
              <h3 className="project-name">Project 2</h3>
              <div className="project-revenue">Coming soon</div>
              <p className="project-description">Next project in development</p>
            </div>

            <div className="project-card">
              <div className="project-logo">
                <img src="https://via.placeholder.com/40x40/6c757d/ffffff?text=💡" alt="Projeto 3" />
              </div>
              <h3 className="project-name">Project 3</h3>
              <div className="project-revenue">Coming soon</div>
              <p className="project-description">Idea in validation phase</p>
            </div>
          </div>
        </div>

        <div className="right-section">
          {/* Space to add content in right column */}
        </div>
      </div>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }


        body {
          font-family: 'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background-color: #000001;
          color: #e2e8f0;
          line-height: 1.6;
          position: relative;
          overflow-x: hidden;
        }

        body::after {
          content: '';
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 200px;
          background: linear-gradient(to top, 
            rgba(49, 99, 223, 0.4) 0%, 
            rgba(49, 99, 223, 0.2) 30%, 
            rgba(49, 99, 223, 0.1) 60%, 
            transparent 100%);
          pointer-events: none;
          z-index: 1;
          filter: blur(2px);
        }

        .pixel-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        #pixelCanvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .container {
          height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0;
          overflow: hidden;
          position: relative;
          z-index: 2;
          max-width: 1400px;
          margin: 0 auto;
        }

        .profile-section {
          background-color: transparent;
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }

        .profile-background-box {
          position: relative;
          max-width: 380px;
          width: 100%;
          padding: 40px;
          border-radius: 24px;
          overflow: hidden;
          
          /* Pure glass effect - no solid background */
          background: transparent;
          
          /* Light blur to show more background */
          backdrop-filter: blur(15px) saturate(120%);
          -webkit-backdrop-filter: blur(15px) saturate(120%);
          
          /* Glass border with subtle highlight */
          border: 1px solid rgba(255, 255, 255, 0.1);
          
          /* Realistic glass shadows and lighting */
          box-shadow: 
            /* Main shadow */
            0 25px 50px -12px rgba(0, 0, 0, 0.7),
            /* Ambient shadow */
            0 10px 30px rgba(0, 0, 0, 0.4),
            /* Inner light reflection top */
            inset 0 2px 2px rgba(255, 255, 255, 0.2),
            /* Inner shadow bottom */
            inset 0 -2px 2px rgba(0, 0, 0, 0.2),
            /* Glass edge highlight */
            inset 0 0 0 1px rgba(255, 255, 255, 0.1),
            /* Outer glow */
            0 0 100px rgba(49, 99, 223, 0.05);
        }

        /* Top edge highlight for realism */
        .profile-background-box::before {
          content: '';
          position: absolute;
          top: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(255, 255, 255, 0.5) 50%, 
            transparent);
          opacity: 0.6;
        }

        /* Bottom edge shadow for depth */
        .profile-background-box::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 10%;
          right: 10%;
          height: 1px;
          background: linear-gradient(90deg, 
            transparent, 
            rgba(0, 0, 0, 0.3) 50%, 
            transparent);
          opacity: 0.4;
        }

        /* Glass refraction effect on edges */
        .glass-edge {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 24px;
          padding: 2px;
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.15) 0%, 
            transparent 30%, 
            transparent 70%, 
            rgba(255, 255, 255, 0.15) 100%);
          -webkit-mask: 
            linear-gradient(#fff 0 0) content-box, 
            linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        /* Chromatic aberration effect for ultra realism */
        .chromatic-aberration {
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          border-radius: 24px;
          border: 1px solid transparent;
          background: linear-gradient(90deg, 
            rgba(255, 0, 0, 0.03), 
            rgba(0, 255, 0, 0.03), 
            rgba(0, 0, 255, 0.03));
          opacity: 0.5;
          pointer-events: none;
          mix-blend-mode: screen;
        }

        .profile-content {
          text-align: center;
          max-width: 300px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .profile-image {
          margin-bottom: 24px;
        }

        .profile-image img {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          object-fit: cover;
          border: 3px solid #f0f0f0;
        }

        .profile-content h1 {
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 12px;
          color: #f8fafc;
        }

        .intro-text {
          font-size: 18px;
          color: #cbd5e1;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        .social-links {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: rgba(71, 85, 105, 0.3);
          color: #cbd5e1;
          text-decoration: none;
          transition: all 0.2s ease;
        }

        .social-link:hover {
          background-color: #3b82f6;
          color: #ffffff;
          transform: translateY(-2px);
        }

        .projects-section {
          background-color: transparent;
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }

        .projects-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
          width: 100%;
          margin: 0 auto;
          padding: 0;
          align-items: center;
          justify-content: center;
        }

        .project-card {
          background-color: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 12px;
          padding: 20px 20px 8px 20px;
          text-align: left;
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 8px;
          height: 160px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
        }


        .project-logo {
          margin-bottom: 4px;
        }

        .project-logo img {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          object-fit: cover;
        }

        .project-name {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #f8fafc;
          line-height: 1.3;
        }

        .project-revenue {
          font-size: 16px;
          font-weight: 500;
          color: #60a5fa;
          margin: 2px 0 4px 0;
        }

        .project-description {
          font-size: 14px;
          color: #cbd5e1;
          line-height: 1.4;
          margin: 0;
        }

        .right-section {
          background-color: transparent;
          padding: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }

        @media (max-width: 1024px) {
          .container {
            grid-template-columns: 1fr;
          }
          
          .profile-section {
            position: static;
            height: auto;
            padding: 40px 20px;
          }
          
          .projects-section {
            padding: 40px 20px;
          }
          
          .right-section {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .profile-section {
            padding: 30px 20px;
          }
          
          .profile-content h1 {
            font-size: 24px;
          }
          
          .intro-text {
            font-size: 16px;
            margin-bottom: 24px;
          }
          
          .projects-grid {
            max-width: 500px;
            gap: 20px;
          }
          
          .project-card {
            padding: 24px 20px;
          }
          
          .projects-section {
            padding: 30px 20px;
          }
        }

        @media (max-width: 480px) {
          .profile-section {
            padding: 20px 16px;
          }
          
          .projects-section {
            padding: 20px 16px;
          }
          
          .project-card {
            padding: 20px 16px;
          }
          
          .social-links {
            gap: 12px;
          }
          
          .social-link {
            width: 40px;
            height: 40px;
          }
        }
      `}</style>
    </>
  );
}