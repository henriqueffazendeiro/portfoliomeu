import Head from 'next/head';
import DarlingChart from '../components/DarlingChart';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const createPixelGrid = () => {
      const pixelBg = document.getElementById('pixel-bg');
      if (!pixelBg) return;
      
      pixelBg.innerHTML = '';
      
      const pixelSize = 30;
      const cols = Math.ceil(window.innerWidth / pixelSize) + 1;
      const rows = Math.ceil(window.innerHeight / pixelSize) + 1;
      
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const pixel = document.createElement('div');
          pixel.className = 'pixel';
          pixel.style.left = (col * pixelSize - 2) + 'px';
          pixel.style.top = (row * pixelSize - 2) + 'px';
          pixel.style.animationDelay = ((row + col) * 0.05) + 's';
          pixel.style.zIndex = '10';
          pixelBg.appendChild(pixel);
        }
      }
    };

    // Criar pixels quando o componente montar
    createPixelGrid();

    // Recriar quando a janela redimensionar
    const handleResize = () => createPixelGrid();
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
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

      <div className="pixel-bg" id="pixel-bg"></div>
      
      <div className="container">
        <div className="profile-section">
          <div className="profile-background-box">
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

        @keyframes shimmer {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.2);
          }
        }

        body {
          font-family: 'Rubik', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background-color: #0f172a;
          color: #e2e8f0;
          line-height: 1.6;
          position: relative;
          overflow-x: hidden;
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

        .pixel {
          position: absolute;
          width: 4px;
          height: 4px;
          background-color: rgba(148, 163, 184, 0.8);
          border-radius: 1px;
          animation: shimmer 4s ease-in-out infinite;
        }

        .pixel:nth-child(4n) {
          background-color: rgba(203, 213, 225, 0.7);
        }

        .pixel:nth-child(8n) {
          background-color: rgba(241, 245, 249, 0.6);
        }

        .pixel:nth-child(12n) {
          background-color: rgba(100, 116, 139, 0.9);
        }

        .container {
          height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0;
          overflow: hidden;
          position: relative;
          z-index: 2;
        }

        .profile-section {
          background-color: transparent;
          padding: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }

        .profile-background-box {
          background-color: rgba(30, 41, 59, 0.8);
          border: 1px solid rgba(71, 85, 105, 0.3);
          border-radius: 16px;
          padding: 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          max-width: 380px;
          width: 100%;
        }

        .profile-content {
          text-align: center;
          max-width: 300px;
          margin: 0 auto;
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
          padding: 60px 40px;
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
          padding: 0 20px;
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
          min-height: 160px;
          width: 110%;
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
          padding: 40px;
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