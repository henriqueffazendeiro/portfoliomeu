import { useState, useEffect } from 'react';

export default function DarlingChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh a cada 30 minutos
    const interval = setInterval(fetchData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      console.log('💕 Darling: Fetching data...');
      
      const response = await fetch('/api/stripe-revenue', {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
        setError(null);
        console.log('💕 Darling: Data loaded!', result.data);
      } else {
        throw new Error(result.error || 'API Error');
      }
    } catch (err) {
      console.warn('⚠️ Darling: Using example data');
      console.error(err);
      
      // Fallback with example data (11 months - excluding Jul from last year)
      setData({
        monthly_data: [
          { month: 'Aug', revenue: 412 },
          { month: 'Sep', revenue: 385 },
          { month: 'Oct', revenue: 456 },
          { month: 'Nov', revenue: 521 },
          { month: 'Dec', revenue: 489 },
          { month: 'Jan', revenue: 98 },
          { month: 'Feb', revenue: 123 },
          { month: 'Mar', revenue: 156 },
          { month: 'Apr', revenue: 234 },
          { month: 'May', revenue: 189 },
          { month: 'Jun', revenue: 298 }
        ],
        current_month_revenue: 412,
        total_revenue: 1656
      });
      
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (event, svgRect, points) => {
    if (!svgRect || !points) return;
    
    const mouseX = event.clientX - svgRect.left;
    
    // Find the closest point to mouse position
    let closestIndex = 0;
    let minDistance = Math.abs(points[0].x - mouseX);
    
    for (let i = 1; i < points.length; i++) {
      const distance = Math.abs(points[i].x - mouseX);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }
    
    setMousePosition({ x: mouseX, y: event.clientY - svgRect.top });
    
    // Smooth transition to new month if different
    if (closestIndex !== currentMonthIndex && !isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentMonthIndex(closestIndex);
        setTimeout(() => setIsTransitioning(false), 150);
      }, 50);
    }
    
    return closestIndex;
  };

  const createSVGChart = () => {
    if (!data?.monthly_data?.length) return null;

    // Use all 11 months data (current month + 10 previous months)
    const monthlyData = data.monthly_data;
    
    const maxRevenue = Math.max(...monthlyData.map(d => d.revenue));
    
    const points = monthlyData.map((d, i) => {
      const x = (i / (monthlyData.length - 1)) * 365 + 30;
      const y = 75 - ((d.revenue / maxRevenue) * 60);
      return { x, y, data: d };
    });

    // Get month 3-letter abbreviations
    const monthAbbreviations = monthlyData.map(d => d.month.substring(0, 3));
    
    // Calculate grid values
    const maxValue = Math.ceil(maxRevenue);
    const quarterValue = Math.ceil(maxValue / 4);

    // Criar curva suave usando spline cúbica
    const createSmoothPath = (points) => {
      if (points.length < 2) return '';
      
      let path = `M ${points[0].x} ${points[0].y}`;
      
      for (let i = 0; i < points.length - 1; i++) {
        const current = points[i];
        const next = points[i + 1];
        const cp1x = current.x + (next.x - current.x) * 0.4;
        const cp1y = current.y;
        const cp2x = next.x - (next.x - current.x) * 0.4;
        const cp2y = next.y;
        
        path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
      }
      
      return path;
    };

    const smoothPath = createSmoothPath(points);
    const areaPath = `${smoothPath} L ${points[points.length - 1].x} 75 L 30 75 Z`;

    return (
      <div className="chart-container">
        <svg width="100%" height="100%" viewBox="0 0 400 90" className="revenue-chart">
          <defs>
            <linearGradient id="darling-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#1e40af" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          {/* Value labels */}
          <text x="25" y="19" fontSize="10" fill="#64748b" textAnchor="end" fontFamily="Rubik">€{maxValue}</text>
          <text x="25" y="49" fontSize="10" fill="#64748b" textAnchor="end" fontFamily="Rubik">€{quarterValue}</text>
          
          {/* Horizontal grid lines */}
          <line x1="30" y1="10" x2="395" y2="10" stroke="#9ca3af" strokeWidth="0.7" strokeDasharray="4,6" opacity="0.2" />
          <line x1="30" y1="45" x2="395" y2="45" stroke="#9ca3af" strokeWidth="0.7" strokeDasharray="4,6" opacity="0.2" />
          <line x1="30" y1="75" x2="395" y2="75" stroke="#9ca3af" strokeWidth="0.7" strokeDasharray="4,6" opacity="0.2" />
          
          {/* Vertical grid lines for months */}
          {points.map((point, i) => {
            const isHovered = hoveredPoint && hoveredPoint.index === i;
            return (
              <line 
                key={i} 
                x1={point.x} 
                y1="10" 
                x2={point.x} 
                y2="75" 
                stroke="#9ca3af" 
                strokeWidth="0.7" 
                strokeDasharray={isHovered ? "0" : "4,6"}
                opacity={isHovered ? "0.6" : "0.2"}
              />
            );
          })}
          
          
          {/* Área preenchida */}
          <path 
            d={areaPath}
            fill="url(#darling-gradient)"
          />
          
          {/* Linha principal curva */}
          <path
            d={smoothPath}
            fill="none"
            stroke="#1e40af"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Hover dot on chart line */}
          {hoveredPoint && (
            <circle
              cx={points[hoveredPoint.index].x}
              cy={points[hoveredPoint.index].y}
              r="4"
              fill="#1e40af"
              stroke="#ffffff"
              strokeWidth="2"
            />
          )}
          
          {/* Tooltip SVG square within chart */}
          {hoveredPoint && (
            <g>
              <rect
                x={hoveredPoint.index >= monthlyData.length - 4 ? points[hoveredPoint.index].x - 110 : points[hoveredPoint.index].x + 15}
                y="10"
                width="100"
                height="65"
                fill="#061622"
                rx="8"
              />
              <text
                x={hoveredPoint.index >= monthlyData.length - 4 ? points[hoveredPoint.index].x - 100 : points[hoveredPoint.index].x + 25}
                y="35"
                fontSize="12"
                fill="#b6b6eb"
                textAnchor="start"
                fontFamily="Rubik"
                fontWeight="500"
              >
                {hoveredPoint.month} 2024
              </text>
              <text
                x={hoveredPoint.index >= monthlyData.length - 4 ? points[hoveredPoint.index].x - 100 : points[hoveredPoint.index].x + 25}
                y="55"
                fontSize="14"
                fill="#b6b6eb"
                textAnchor="start"
                fontFamily="Rubik"
                fontWeight="600"
              >
                €{hoveredPoint.revenue}
              </text>
            </g>
          )}
          
          {/* Chart hover area */}
          <rect
            x="30"
            y="10"
            width="365"
            height="65"
            fill="transparent"
            onMouseMove={(e) => {
              const svgRect = e.currentTarget.closest('svg').getBoundingClientRect();
              const closestIndex = handleMouseMove(e, svgRect, points);
              setIsHovering(true);
              
              // Set hovered point to the closest one
              if (closestIndex !== undefined) {
                setHoveredPoint({ ...points[closestIndex].data, index: closestIndex });
              }
            }}
            onMouseLeave={() => {
              setHoveredPoint(null);
              setIsHovering(false);
            }}
            style={{ cursor: 'pointer' }}
          />
          
          {/* Month labels */}
          {points.map((point, i) => (
            <text key={i} x={point.x} y="89" fontSize="10" fill="#64748b" textAnchor="middle" fontFamily="Rubik">
              {monthAbbreviations[i]}
            </text>
          ))}
        </svg>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="darling-card">
        <div className="card-header">
          <div className="project-logo">
            <img src="/logo.png" alt="Darling" />
          </div>
          <div className="right-content">
            <h3 className="project-name">Darling</h3>
            <div className="project-revenue darling-revenue">
              <div className="stripe-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13.479 9.883c-1.626-.604-2.512-1.067-2.512-1.803 0-.622.511-.977 1.423-.977 1.667 0 3.379.642 4.558 1.22l.666-4.111c-.935-.446-2.847-1.177-5.49-1.177-1.87 0-3.425.489-4.536 1.401-1.155.95-1.292 2.28-1.292 3.054 0 2.581 1.931 3.461 4.39 4.226 1.626.604 2.512 1.067 2.512 1.803 0 .622-.511.977-1.423.977-1.667 0-3.379-.642-4.558-1.22l-.666 4.111c.935.446 2.847 1.177 5.49 1.177 1.87 0 3.425-.489 4.536-1.401 1.155-.95 1.292-2.28 1.292-3.054 0-2.581-1.931-3.461-4.39-4.226z"/>
                </svg>
              </div>
              <div className="revenue-text">
                <span className="revenue-symbol">€</span>
                <span className="revenue-amount">...</span>
                <span className="revenue-period">/mo</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="card-content">
          <p className="project-description">Transform your relationship into webpage</p>
          <div className="loading-chart">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="darling-card">
      <div className="card-header">
        <div className="project-logo">
          <img src="/logo.png" alt="Darling" />
        </div>
        <div className="right-content">
          <h3 className="project-name">Darling</h3>
          <div className="project-revenue darling-revenue">
            <div className="stripe-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.479 9.883c-1.626-.604-2.512-1.067-2.512-1.803 0-.622.511-.977 1.423-.977 1.667 0 3.379.642 4.558 1.22l.666-4.111c-.935-.446-2.847-1.177-5.49-1.177-1.87 0-3.425.489-4.536 1.401-1.155.95-1.292 2.28-1.292 3.054 0 2.581 1.931 3.461 4.39 4.226 1.626.604 2.512 1.067 2.512 1.803 0 .622-.511.977-1.423.977-1.667 0-3.379-.642-4.558-1.22l-.666 4.111c.935.446 2.847 1.177 5.49 1.177 1.87 0 3.425-.489 4.536-1.401 1.155-.95 1.292-2.28 1.292-3.054 0-2.581-1.931-3.461-4.39-4.226z"/>
              </svg>
            </div>
            <div className="revenue-text">
              <span className="revenue-symbol">€</span>
              <span className="revenue-amount">{data?.current_month_revenue || 0}</span>
              <span className="revenue-period">/mo</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card-content">
        <p className="project-description">Transform your relationship into webpage</p>
        
        {error && (
          <div className="error-notice">
            <small>⚠️ Using example data</small>
          </div>
        )}
        
        {createSVGChart()}
      </div>
      
      <style jsx>{`
        .darling-card {
          background: #ffffff;
          border: none;
          border-radius: 12px;
          padding: 20px 20px 8px 20px;
          text-align: left;
          transition: all 0.3s ease;
          cursor: pointer;
          min-height: 160px;
          width: 100%;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        }


        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .right-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex: 1;
          height: 28px;
        }

        .project-logo {
          display: flex;
          align-items: center;
        }

        .project-logo img {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          object-fit: cover;
        }

        .darling-revenue {
          background: linear-gradient(to right, #635bff 25%, #e2e8f0 25%);
          border-radius: 10px;
          padding: 0;
          display: flex;
          align-items: center;
          color: #64748b !important;
          font-size: 11px;
          font-weight: 500;
          margin: 0;
          height: 18px;
          overflow: hidden;
          width: 85px;
        }

        .stripe-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 25%;
          height: 100%;
          color: white;
          flex-shrink: 0;
        }

        .stripe-icon svg {
          width: 13px;
          height: 13px;
        }

        .revenue-text {
          display: flex;
          align-items: center;
          gap: 0.125rem;
          padding: 0 3px 0 5px;
          flex: 1;
          justify-content: flex-start;
          font-family: 'Rubik', sans-serif;
          color: #000000 !important;
        }

        .revenue-symbol {
          opacity: 1;
          color: #000000;
          font-weight: 400;
        }

        .revenue-amount {
          font-weight: 400;
          color: #000000;
        }

        .revenue-period {
          opacity: 1;
          font-weight: 400;
          color: #000000;
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 4px;
        }

        .project-name {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
          color: #1e293b;
          line-height: 1;
          display: flex;
          align-items: center;
        }

        .project-description {
          font-size: 14px;
          color: #000000;
          line-height: 1.4;
          margin: -2px 0 0 0;
          font-family: 'Rubik', sans-serif;
          font-weight: 400;
        }

        .chart-container {
          margin-top: 12px;
          height: 90px;
          width: 100%;
          position: relative;
        }

        .revenue-chart .chart-dot {
          transition: r 0.2s ease;
        }

        .revenue-chart {
          transition: all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .revenue-chart.transitioning {
          transition: all 0.15s ease-out;
        }

        .revenue-chart .chart-dot:hover {
          r: 5;
        }

        .loading-chart {
          margin-top: 12px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #1e40af20;
          border-top: 2px solid #1e40af;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-notice {
          font-size: 11px;
          color: #64748b;
          text-align: center;
          margin-top: 4px;
        }
        
      `}</style>
    </div>
  );
}