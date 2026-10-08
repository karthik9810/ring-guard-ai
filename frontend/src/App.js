import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState('Connecting...');
  const [threatLevel, setThreatLevel] = useState('LOW');
  const [peopleCount, setPeopleCount] = useState(0);
  const [packageDetected, setPackageDetected] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(null);
  const [description, setDescription] = useState('Monitoring...');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [threatScore, setThreatScore] = useState(10);
  const [notifications, setNotifications] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sensitivity, setSensitivity] = useState(50);
  const [alertSMS, setAlertSMS] = useState(true);
  const [alertEmail, setAlertEmail] = useState(true);
  const [graphData, setGraphData] = useState([0,0,0,0,0,0,0,0,0,0]);
  const [uptime, setUptime] = useState(0);
  const ws = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
      setCurrentDate(new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric',
        month: 'long', day: 'numeric'
      }));
      setUptime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/ws');
    ws.current.onopen = () => setStatus('LIVE');
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'analysis') {
        const score = data.data.threat_level === 'HIGH' ? 90 :
          data.data.threat_level === 'MEDIUM' ? 50 : 10;
        setThreatLevel(data.data.threat_level);
        setPeopleCount(data.data.people_count);
        setPackageDetected(data.data.package_detected);
        setDescription(data.data.description);
        setCurrentFrame(data.frame);
        setThreatScore(score);
        setGraphData(prev => [...prev.slice(1), score]);
        const newEvent = {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          threat: data.data.threat_level,
          description: data.data.description,
          people: data.data.people_count
        };
        setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
        if (data.data.suspicious) {
          setNotifications(prev => [{
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            type: data.data.threat_level === 'HIGH' ? '🚨 SMS' : '📧 Email',
            message: data.data.alert_message,
          }, ...prev.slice(0, 9)]);
        }
        if (data.data.people_count > 0) {
          setVisitors(prev => [{
            id: Date.now(),
            time: new Date().toLocaleTimeString(),
            type: 'Unknown',
            threat: data.data.threat_level,
            frame: data.frame
          }, ...prev.slice(0, 5)]);
        }
      }
    };
    ws.current.onclose = () => setStatus('OFFLINE');
    return () => ws.current.close();
  }, []);

  const getThreatColor = (level) => {
    if (level === 'HIGH') return '#ff4757';
    if (level === 'MEDIUM') return '#ffa502';
    return '#2ed573';
  };

  const getThreatGlow = (level) => {
    if (level === 'HIGH') return '0 0 20px rgba(255,71,87,0.5)';
    if (level === 'MEDIUM') return '0 0 20px rgba(255,165,2,0.5)';
    return '0 0 20px rgba(46,213,115,0.5)';
  };

  const formatUptime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  const tabs = [
    { id: 'dashboard', icon: '⬡', label: 'DASHBOARD' },
    { id: 'analytics', icon: '◈', label: 'ANALYTICS' },
    { id: 'visitors', icon: '◉', label: 'VISITORS' },
    { id: 'notifications', icon: '◎', label: 'ALERTS' },
    { id: 'settings', icon: '◫', label: 'SETTINGS' },
  ];

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;600;700&display=swap');
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body { 
      background: #020510;
      overflow-x: hidden;
    }

    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #020510; }
    ::-webkit-scrollbar-thumb { 
      background: linear-gradient(#4488ff, #0033aa);
      border-radius: 2px;
    }

    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(1.3); }
      100% { opacity: 1; transform: scale(1); }
    }

    @keyframes scan {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    @keyframes slideIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes glow {
      0%, 100% { box-shadow: 0 0 5px #4488ff33; }
      50% { box-shadow: 0 0 20px #4488ff66; }
    }

    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .tab-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: 'Share Tech Mono', monospace;
    }

    .tab-btn:hover {
      background: rgba(68,136,255,0.1) !important;
      color: #4488ff !important;
    }

    .card {
      transition: all 0.3s ease;
    }

    .card:hover {
      border-color: #4488ff44 !important;
      transform: translateY(-1px);
    }

    .stat-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }

    .threat-high {
      animation: glow 2s infinite;
    }
  `;

  const DashboardTab = () => (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px' }}>
      
      {/* Left Column */}
      <div>
        {/* Camera Feed */}
        <div className="card" style={{
          backgroundColor: '#080d1a',
          borderRadius: '16px',
          border: '1px solid #1a2a4a',
          padding: '20px',
          marginBottom: '20px',
          animation: 'slideIn 0.5s ease',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: '#ff4757',
                animation: 'pulse 1s infinite' }}/>
              <span style={{ fontSize: '11px', color: '#4488ff',
                letterSpacing: '3px', fontFamily: 'Share Tech Mono' }}>
                LIVE CAMERA FEED
              </span>
            </div>
            <span style={{ fontSize: '10px', color: '#333',
              fontFamily: 'Share Tech Mono' }}>
              CAM-01 • FRONT DOOR
            </span>
          </div>
          <div style={{
            backgroundColor: '#020408',
            borderRadius: '12px',
            height: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            border: '1px solid #1a2a4a',
            position: 'relative',
          }}>
            {currentFrame ? (
              <>
                <img
                  src={`data:image/jpeg;base64,${currentFrame}`}
                  alt="Live"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Scan line effect */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0,
                  height: '2px',
                  background: 'linear-gradient(90deg, transparent, #4488ff44, transparent)',
                  animation: 'scan 3s linear infinite',
                }}/>
                {/* Corner brackets */}
                {['top-left','top-right','bottom-left','bottom-right'].map(pos => (
                  <div key={pos} style={{
                    position: 'absolute',
                    width: '20px', height: '20px',
                    ...(pos.includes('top') ? { top: '10px' } : { bottom: '10px' }),
                    ...(pos.includes('left') ? { left: '10px' } : { right: '10px' }),
                    borderTop: pos.includes('top') ? '2px solid #4488ff' : 'none',
                    borderBottom: pos.includes('bottom') ? '2px solid #4488ff' : 'none',
                    borderLeft: pos.includes('left') ? '2px solid #4488ff' : 'none',
                    borderRight: pos.includes('right') ? '2px solid #4488ff' : 'none',
                  }}/>
                ))}
                {/* Threat overlay */}
                {threatLevel === 'HIGH' && (
                  <div style={{
                    position: 'absolute', inset: 0,
                    border: '3px solid #ff475744',
                    borderRadius: '12px',
                    animation: 'glow 0.5s infinite',
                  }}/>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', color: '#1a2a4a' }}>
                <div style={{ fontSize: '50px', marginBottom: '15px',
                  opacity: 0.3 }}>⬡</div>
                <div style={{ fontSize: '11px', letterSpacing: '4px',
                  fontFamily: 'Share Tech Mono' }}>
                  AWAITING SIGNAL...
                </div>
                <div style={{ fontSize: '10px', color: '#0d1530',
                  marginTop: '8px', animation: 'blink 1s infinite' }}>
                  ▮
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Activity Map */}
        <div className="card" style={{
          backgroundColor: '#080d1a',
          borderRadius: '16px',
          border: '1px solid #1a2a4a',
          padding: '20px',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '11px', color: '#4488ff',
            letterSpacing: '3px', marginBottom: '15px',
            fontFamily: 'Share Tech Mono' }}>
            ◈ LIVE ACTIVITY MAP
          </div>
          <div style={{
            backgroundColor: '#020408',
            borderRadius: '10px',
            height: '160px',
            position: 'relative',
            border: '1px solid #0d1530',
            overflow: 'hidden',
          }}>
            {/* Grid */}
            {[25,50,75].map(p => (
              <div key={p} style={{
                position: 'absolute', left: `${p}%`,
                top: 0, bottom: 0,
                borderLeft: '1px solid #0d1530',
              }}/>
            ))}
            {[33,66].map(p => (
              <div key={p} style={{
                position: 'absolute', top: `${p}%`,
                left: 0, right: 0,
                borderTop: '1px solid #0d1530',
              }}/>
            ))}
            {/* Zones */}
            {[
              { label: 'FRONT DOOR', x: '5%', y: '8%', active: true },
              { label: 'BACK DOOR', x: '53%', y: '8%', active: false },
              { label: 'GARAGE', x: '5%', y: '58%', active: false },
              { label: 'DRIVEWAY', x: '53%', y: '58%', active: false },
            ].map((zone, i) => (
              <div key={i} style={{
                position: 'absolute',
                left: zone.x, top: zone.y,
                fontSize: '9px',
                color: zone.active ? '#4488ff88' : '#1a2a4a',
                fontFamily: 'Share Tech Mono',
                letterSpacing: '1px',
              }}>
                {zone.active ? '▸ ' : '○ '}{zone.label}
              </div>
            ))}
            {/* Activity dot */}
            {peopleCount > 0 && (
              <>
                <div style={{
                  position: 'absolute',
                  left: '22%', top: '35%',
                  width: '14px', height: '14px',
                  borderRadius: '50%',
                  backgroundColor: getThreatColor(threatLevel),
                  boxShadow: getThreatGlow(threatLevel),
                  animation: 'pulse 1s infinite',
                }}/>
                <div style={{
                  position: 'absolute',
                  left: '20%', top: '33%',
                  width: '18px', height: '18px',
                  borderRadius: '50%',
                  border: `1px solid ${getThreatColor(threatLevel)}66`,
                  animation: 'pulse 1.5s infinite',
                }}/>
              </>
            )}
            {/* Radar sweep */}
            <div style={{
              position: 'absolute',
              bottom: '8px', right: '8px',
              fontSize: '9px',
              color: '#1a2a4a',
              fontFamily: 'Share Tech Mono',
            }}>
              RADAR ACTIVE ●
            </div>
          </div>
        </div>

        {/* Event Log */}
        <div className="card" style={{
          backgroundColor: '#080d1a',
          borderRadius: '16px',
          border: '1px solid #1a2a4a',
          padding: '20px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '15px' }}>
            <span style={{ fontSize: '11px', color: '#4488ff',
              letterSpacing: '3px', fontFamily: 'Share Tech Mono' }}>
              ◎ EVENT LOG
            </span>
            <span style={{ fontSize: '10px', color: '#333',
              fontFamily: 'Share Tech Mono' }}>
              {events.length} EVENTS
            </span>
          </div>
          {events.length === 0 ? (
            <div style={{ color: '#1a2a4a', textAlign: 'center',
              padding: '30px', fontSize: '11px',
              fontFamily: 'Share Tech Mono', letterSpacing: '2px' }}>
              — NO EVENTS RECORDED —
            </div>
          ) : events.map((event, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 8px',
              borderBottom: '1px solid #0d1530',
              fontSize: '11px',
              animation: i === 0 ? 'slideIn 0.3s ease' : 'none',
            }}>
              <div style={{
                width: '6px', height: '6px', borderRadius: '50%',
                backgroundColor: getThreatColor(event.threat),
                boxShadow: `0 0 6px ${getThreatColor(event.threat)}`,
                flexShrink: 0,
              }}/>
              <span style={{ color: '#2a3a5a', minWidth: '85px',
                fontFamily: 'Share Tech Mono' }}>
                {event.time}
              </span>
              <span style={{
                color: getThreatColor(event.threat),
                minWidth: '75px',
                fontFamily: 'Share Tech Mono',
                fontSize: '10px',
              }}>
                [{event.threat}]
              </span>
              <span style={{ color: '#6a7a9a', flex: 1 }}>
                {event.description}
              </span>
              <span style={{ color: '#2a4a8a',
                fontFamily: 'Share Tech Mono', fontSize: '10px' }}>
                ◉{event.people}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column */}
      <div>
        {/* Threat Level */}
        <div style={{
          backgroundColor: '#080d1a',
          borderRadius: '16px',
          border: `1px solid ${getThreatColor(threatLevel)}33`,
          padding: '20px',
          marginBottom: '15px',
          textAlign: 'center',
          boxShadow: getThreatGlow(threatLevel),
          transition: 'all 0.5s ease',
        }}>
          <div style={{ fontSize: '10px', color: '#555',
            letterSpacing: '4px', marginBottom: '10px',
            fontFamily: 'Share Tech Mono' }}>
            ⚠ THREAT LEVEL
          </div>
          <div style={{
            fontSize: '42px',
            fontWeight: '700',
            color: getThreatColor(threatLevel),
            letterSpacing: '6px',
            fontFamily: 'Rajdhani, sans-serif',
            textShadow: `0 0 30px ${getThreatColor(threatLevel)}66`,
          }}>
            {threatLevel}
          </div>
          {/* Meter */}
          <div style={{
            height: '4px',
            backgroundColor: '#0d1530',
            borderRadius: '2px',
            marginTop: '15px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${threatScore}%`,
              background: `linear-gradient(90deg, ${getThreatColor(threatLevel)}88, ${getThreatColor(threatLevel)})`,
              borderRadius: '2px',
              transition: 'width 0.8s ease',
              boxShadow: `0 0 10px ${getThreatColor(threatLevel)}`,
            }}/>
          </div>
          <div style={{ fontSize: '10px', color: '#2a3a5a',
            marginTop: '8px', fontFamily: 'Share Tech Mono' }}>
            THREAT SCORE: {threatScore}/100
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '12px', marginBottom: '15px' }}>
          {[
            { label: 'PEOPLE', value: peopleCount, icon: '◉', color: '#4488ff' },
            { label: 'PACKAGE', value: packageDetected ? 'YES' : 'NO',
              icon: '◈', color: packageDetected ? '#2ed573' : '#2a3a5a' },
          ].map((stat, i) => (
            <div className="stat-card" key={i} style={{
              backgroundColor: '#080d1a',
              border: `1px solid ${stat.color}22`,
              borderRadius: '12px',
              padding: '15px',
              textAlign: 'center',
              transition: 'all 0.3s ease',
              cursor: 'default',
            }}>
              <div style={{ fontSize: '18px', color: stat.color,
                marginBottom: '8px' }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '26px', fontWeight: 'bold',
                color: stat.color,
                fontFamily: 'Rajdhani, sans-serif' }}>
                {stat.value}
              </div>
              <div style={{ fontSize: '9px', color: '#333',
                letterSpacing: '2px', marginTop: '5px',
                fontFamily: 'Share Tech Mono' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* AI Analysis */}
        <div className="card" style={{
          backgroundColor: '#080d1a',
          borderRadius: '12px',
          border: '1px solid #1a2a4a',
          padding: '15px',
          marginBottom: '15px',
        }}>
          <div style={{ fontSize: '10px', color: '#4488ff',
            letterSpacing: '3px', marginBottom: '12px',
            fontFamily: 'Share Tech Mono' }}>
            ◈ AI ANALYSIS
          </div>
          <div style={{ fontSize: '12px', color: '#4a5a7a',
            lineHeight: '1.8', fontFamily: 'Share Tech Mono' }}>
            <span style={{ color: '#2ed57344' }}>▸ </span>
            {description}
          </div>
        </div>

        {/* Threat Graph */}
        <div className="card" style={{
          backgroundColor: '#080d1a',
          borderRadius: '12px',
          border: '1px solid #1a2a4a',
          padding: '15px',
          marginBottom: '15px',
        }}>
          <div style={{ fontSize: '10px', color: '#4488ff',
            letterSpacing: '3px', marginBottom: '12px',
            fontFamily: 'Share Tech Mono' }}>
            ◎ THREAT GRAPH
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end',
            gap: '3px', height: '70px' }}>
            {graphData.map((val, i) => (
              <div key={i} style={{
                flex: 1,
                height: `${val || 3}%`,
                background: val >= 80
                  ? 'linear-gradient(180deg, #ff4757, #ff475788)'
                  : val >= 40
                  ? 'linear-gradient(180deg, #ffa502, #ffa50288)'
                  : 'linear-gradient(180deg, #2ed573, #2ed57322)',
                borderRadius: '2px 2px 0 0',
                transition: 'height 0.5s ease',
                opacity: 0.3 + (i / graphData.length) * 0.7,
              }}/>
            ))}
          </div>
          <div style={{ height: '1px', backgroundColor: '#0d1530',
            marginTop: '5px' }}/>
        </div>

        {/* System Status */}
        <div className="card" style={{
          backgroundColor: '#080d1a',
          borderRadius: '12px',
          border: '1px solid #1a2a4a',
          padding: '15px',
          marginBottom: '15px',
        }}>
          <div style={{ fontSize: '10px', color: '#4488ff',
            letterSpacing: '3px', marginBottom: '12px',
            fontFamily: 'Share Tech Mono' }}>
            ◫ SYSTEM STATUS
          </div>
          {[
            { label: 'UPTIME', value: formatUptime(uptime), color: '#2ed573' },
            { label: 'CAMERA', value: 'ACTIVE', color: '#2ed573' },
            { label: 'AWS BEDROCK', value: 'STANDBY', color: '#ffa502' },
            { label: 'ALEXA+', value: 'READY', color: '#2ed573' },
            { label: 'RING API', value: 'CONNECTED', color: '#2ed573' },
          ].map((sys, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '7px 0',
              borderBottom: i < 4 ? '1px solid #0d1530' : 'none',
            }}>
              <span style={{ fontSize: '10px', color: '#2a3a5a',
                fontFamily: 'Share Tech Mono' }}>
                {sys.label}
              </span>
              <span style={{
                fontSize: '9px', color: sys.color,
                backgroundColor: `${sys.color}11`,
                padding: '2px 8px', borderRadius: '3px',
                border: `1px solid ${sys.color}33`,
                fontFamily: 'Share Tech Mono',
              }}>
                {sys.value}
              </span>
            </div>
          ))}
        </div>

        {/* Powered By */}
        <div style={{
          backgroundColor: '#080d1a',
          borderRadius: '12px',
          border: '1px solid #0d1530',
          padding: '12px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #080d1a, #080d14)',
        }}>
          <div style={{ fontSize: '9px', color: '#2a3a5a',
            letterSpacing: '3px', marginBottom: '10px',
            fontFamily: 'Share Tech Mono' }}>
            POWERED BY
          </div>
          <div style={{ display: 'flex', justifyContent: 'center',
            gap: '8px', flexWrap: 'wrap' }}>
            {['AWS BEDROCK', 'RING API', 'ALEXA+', 'OPENCV'].map(tech => (
              <span key={tech} style={{
                background: 'linear-gradient(135deg, #0d2010, #0a1a08)',
                color: '#2ed573',
                padding: '4px 10px', borderRadius: '4px',
                fontSize: '9px',
                border: '1px solid #2ed57322',
                fontFamily: 'Share Tech Mono',
                letterSpacing: '1px',
              }}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ANALYTICS TAB
  const AnalyticsTab = () => (
    <div style={{ animation: 'slideIn 0.3s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
        gap: '15px', marginBottom: '20px' }}>
        {[
          { label: 'TOTAL EVENTS', value: events.length, icon: '◎', color: '#4488ff' },
          { label: 'HIGH THREATS', value: events.filter(e => e.threat === 'HIGH').length, icon: '⬡', color: '#ff4757' },
          { label: 'MEDIUM', value: events.filter(e => e.threat === 'MEDIUM').length, icon: '◈', color: '#ffa502' },
          { label: 'LOW THREATS', value: events.filter(e => e.threat === 'LOW').length, icon: '◉', color: '#2ed573' },
        ].map((stat, i) => (
          <div className="stat-card" key={i} style={{
            backgroundColor: '#080d1a',
            border: `1px solid ${stat.color}22`,
            borderRadius: '16px', padding: '20px',
            textAlign: 'center',
            boxShadow: `0 4px 20px ${stat.color}11`,
          }}>
            <div style={{ fontSize: '24px', color: stat.color,
              marginBottom: '10px' }}>{stat.icon}</div>
            <div style={{ fontSize: '36px', fontWeight: '700',
              color: stat.color, fontFamily: 'Rajdhani, sans-serif' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: '9px', color: '#333',
              letterSpacing: '2px', marginTop: '8px',
              fontFamily: 'Share Tech Mono' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '20px', marginBottom: '20px' }}>
        {/* Distribution */}
        <div className="card" style={{
          backgroundColor: '#080d1a',
          borderRadius: '16px',
          border: '1px solid #1a2a4a',
          padding: '20px',
        }}>
          <div style={{ fontSize: '11px', color: '#4488ff',
            letterSpacing: '3px', marginBottom: '20px',
            fontFamily: 'Share Tech Mono' }}>
            THREAT DISTRIBUTION
          </div>
          <div style={{ height: '6px', display: 'flex',
            borderRadius: '3px', overflow: 'hidden',
            backgroundColor: '#0d1530', marginBottom: '15px' }}>
            {events.length > 0 ? (<>
              <div style={{
                width: `${(events.filter(e => e.threat === 'HIGH').length / events.length) * 100}%`,
                background: 'linear-gradient(90deg, #ff4757, #ff475788)',
                transition: 'width 0.5s ease',
              }}/>
              <div style={{
                width: `${(events.filter(e => e.threat === 'MEDIUM').length / events.length) * 100}%`,
                background: 'linear-gradient(90deg, #ffa502, #ffa50288)',
                transition: 'width 0.5s ease',
              }}/>
              <div style={{
                width: `${(events.filter(e => e.threat === 'LOW').length / events.length) * 100}%`,
                background: 'linear-gradient(90deg, #2ed573, #2ed57388)',
                transition: 'width 0.5s ease',
              }}/>
            </>) : (
              <div style={{ width: '100%', backgroundColor: '#1a2a4a' }}/>
            )}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            fontSize: '10px', fontFamily: 'Share Tech Mono' }}>
            <span style={{ color: '#ff4757' }}>● HIGH</span>
            <span style={{ color: '#ffa502' }}>● MEDIUM</span>
            <span style={{ color: '#2ed573' }}>● LOW</span>
          </div>
        </div>

        {/* Graph */}
        <div className="card" style={{
          backgroundColor: '#080d1a',
          borderRadius: '16px',
          border: '1px solid #1a2a4a',
          padding: '20px',
        }}>
          <div style={{ fontSize: '11px', color: '#4488ff',
            letterSpacing: '3px', marginBottom: '15px',
            fontFamily: 'Share Tech Mono' }}>
            THREAT HISTORY
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end',
            gap: '4px', height: '100px' }}>
            {graphData.map((val, i) => (
              <div key={i} style={{
                flex: 1,
                height: `${val || 3}%`,
                background: val >= 80
                  ? 'linear-gradient(180deg, #ff4757, #ff475733)'
                  : val >= 40
                  ? 'linear-gradient(180deg, #ffa502, #ffa50233)'
                  : 'linear-gradient(180deg, #2ed573, #2ed57333)',
                borderRadius: '3px 3px 0 0',
                transition: 'height 0.5s ease',
              }}/>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="card" style={{
        backgroundColor: '#080d1a',
        borderRadius: '16px',
        border: '1px solid #1a2a4a',
        padding: '20px',
      }}>
        <div style={{ fontSize: '11px', color: '#4488ff',
          letterSpacing: '3px', marginBottom: '15px',
          fontFamily: 'Share Tech Mono' }}>
          SYSTEM STATUS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
          gap: '12px' }}>
          {[
            { label: 'CAMERA', status: 'ACTIVE', color: '#2ed573' },
            { label: 'AWS BEDROCK', status: 'STANDBY', color: '#ffa502' },
            { label: 'ALEXA+', status: 'READY', color: '#2ed573' },
            { label: 'RING API', status: 'CONNECTED', color: '#2ed573' },
            { label: 'SNS ALERTS', status: 'ACTIVE', color: '#2ed573' },
            { label: 'DYNAMODB', status: 'ACTIVE', color: '#2ed573' },
          ].map((sys, i) => (
            <div key={i} style={{
              backgroundColor: '#050810',
              border: '1px solid #0d1530',
              borderRadius: '10px', padding: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontSize: '10px', color: '#2a3a5a',
                fontFamily: 'Share Tech Mono' }}>
                {sys.label}
              </span>
              <span style={{
                fontSize: '9px', color: sys.color,
                backgroundColor: `${sys.color}11`,
                padding: '2px 8px', borderRadius: '3px',
                border: `1px solid ${sys.color}33`,
                fontFamily: 'Share Tech Mono',
              }}>
                {sys.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // VISITORS TAB
  const VisitorsTab = () => (
    <div style={{ animation: 'slideIn 0.3s ease' }}>
      <div className="card" style={{
        backgroundColor: '#080d1a',
        borderRadius: '16px',
        border: '1px solid #1a2a4a',
        padding: '20px',
      }}>
        <div style={{ fontSize: '11px', color: '#4488ff',
          letterSpacing: '3px', marginBottom: '20px',
          fontFamily: 'Share Tech Mono' }}>
          ◉ VISITOR LOG — {visitors.length} DETECTED
        </div>
        {visitors.length === 0 ? (
          <div style={{ color: '#1a2a4a', textAlign: 'center',
            padding: '60px', fontSize: '11px',
            fontFamily: 'Share Tech Mono', letterSpacing: '3px' }}>
            — NO VISITORS DETECTED —
          </div>
        ) : visitors.map((v, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '15px',
            padding: '15px', borderBottom: '1px solid #0d1530',
            animation: 'slideIn 0.3s ease',
          }}>
            <div style={{
              width: '55px', height: '55px',
              borderRadius: '10px',
              backgroundColor: '#020408',
              border: `1px solid ${getThreatColor(v.threat)}33`,
              overflow: 'hidden', flexShrink: 0,
              boxShadow: `0 0 10px ${getThreatColor(v.threat)}22`,
            }}>
              {v.frame && (
                <img
                  src={`data:image/jpeg;base64,${v.frame}`}
                  alt="visitor"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', color: '#6a7a9a',
                marginBottom: '5px', fontFamily: 'Rajdhani, sans-serif',
                fontWeight: '600' }}>
                {v.type} Visitor
              </div>
              <div style={{ fontSize: '10px', color: '#2a3a5a',
                fontFamily: 'Share Tech Mono' }}>
                ◎ {v.time}
              </div>
            </div>
            <span style={{
              fontSize: '10px',
              color: getThreatColor(v.threat),
              backgroundColor: `${getThreatColor(v.threat)}11`,
              padding: '5px 12px', borderRadius: '6px',
              border: `1px solid ${getThreatColor(v.threat)}33`,
              fontFamily: 'Share Tech Mono',
              boxShadow: `0 0 10px ${getThreatColor(v.threat)}22`,
            }}>
              [{v.threat}]
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // ALERTS TAB
  const AlertsTab = () => (
    <div style={{ animation: 'slideIn 0.3s ease' }}>
      <div className="card" style={{
        backgroundColor: '#080d1a',
        borderRadius: '16px',
        border: '1px solid #1a2a4a',
        padding: '20px',
      }}>
        <div style={{ fontSize: '11px', color: '#4488ff',
          letterSpacing: '3px', marginBottom: '20px',
          fontFamily: 'Share Tech Mono' }}>
          ◎ ALERT HISTORY — {notifications.length} SENT
        </div>
        {notifications.length === 0 ? (
          <div style={{ color: '#1a2a4a', textAlign: 'center',
            padding: '60px', fontSize: '11px',
            fontFamily: 'Share Tech Mono', letterSpacing: '3px' }}>
            — NO ALERTS SENT —
          </div>
        ) : notifications.map((n, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: '15px',
            padding: '15px', borderBottom: '1px solid #0d1530',
            animation: 'slideIn 0.3s ease',
          }}>
            <div style={{ fontSize: '24px' }}>
              {n.type.includes('SMS') ? '📱' : '📧'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#6a7a9a',
                marginBottom: '5px', fontFamily: 'Share Tech Mono' }}>
                {n.type} — {n.message || 'Security alert triggered'}
              </div>
              <div style={{ fontSize: '10px', color: '#2a3a5a',
                fontFamily: 'Share Tech Mono' }}>◎ {n.time}</div>
            </div>
            <span style={{
              fontSize: '9px', color: '#2ed573',
              backgroundColor: 'rgba(46,213,115,0.1)',
              padding: '4px 10px', borderRadius: '4px',
              border: '1px solid #2ed57333',
              fontFamily: 'Share Tech Mono',
            }}>
              SENT ✓
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // SETTINGS TAB
  const SettingsTab = () => (
    <div style={{ animation: 'slideIn 0.3s ease' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '20px' }}>
        <div className="card" style={{
          backgroundColor: '#080d1a',
          borderRadius: '16px',
          border: '1px solid #1a2a4a',
          padding: '20px',
        }}>
          <div style={{ fontSize: '11px', color: '#4488ff',
            letterSpacing: '3px', marginBottom: '20px',
            fontFamily: 'Share Tech Mono' }}>
            ⚙ ALERT PREFERENCES
          </div>

          {/* SMS Toggle */}
          {[
            { label: '📱 SMS Alerts', sub: 'Send SMS on HIGH threat',
              val: alertSMS, set: setAlertSMS },
            { label: '📧 Email Alerts', sub: 'Send on MEDIUM/HIGH threat',
              val: alertEmail, set: setAlertEmail },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', padding: '15px 0',
              borderBottom: '1px solid #0d1530',
            }}>
              <div>
                <div style={{ fontSize: '13px', color: '#6a7a9a',
                  marginBottom: '4px', fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: '600' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '10px', color: '#2a3a5a',
                  fontFamily: 'Share Tech Mono' }}>
                  {item.sub}
                </div>
              </div>
              <div onClick={() => item.set(!item.val)} style={{
                width: '46px', height: '24px',
                borderRadius: '12px',
                background: item.val
                  ? 'linear-gradient(90deg, #2ed573, #00aa44)'
                  : '#0d1530',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.3s ease',
                border: `1px solid ${item.val ? '#2ed57344' : '#1a2a4a'}`,
                boxShadow: item.val ? '0 0 10px #2ed57333' : 'none',
              }}>
                <div style={{
                  position: 'absolute',
                  top: '3px',
                  left: item.val ? '24px' : '3px',
                  width: '16px', height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  transition: 'left 0.3s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}/>
              </div>
            </div>
          ))}

          {/* Sensitivity */}
          <div style={{ paddingTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between',
              marginBottom: '12px', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '13px', color: '#6a7a9a',
                  marginBottom: '4px', fontFamily: 'Rajdhani, sans-serif',
                  fontWeight: '600' }}>
                  🎯 Detection Sensitivity
                </div>
                <div style={{ fontSize: '10px', color: '#2a3a5a',
                  fontFamily: 'Share Tech Mono' }}>
                  Higher = More alerts
                </div>
              </div>
              <span style={{ fontSize: '22px', fontWeight: '700',
                color: '#4488ff', fontFamily: 'Rajdhani, sans-serif' }}>
                {sensitivity}%
              </span>
            </div>
            <input
              type="range" min="0" max="100"
              value={sensitivity}
              onChange={(e) => setSensitivity(e.target.value)}
              style={{ width: '100%', accentColor: '#4488ff',
                height: '4px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between',
              fontSize: '9px', color: '#2a3a5a', marginTop: '8px',
              fontFamily: 'Share Tech Mono' }}>
              <span>◉ LOW</span>
              <span>◈ MEDIUM</span>
              <span>⬡ HIGH</span>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="card" style={{
          backgroundColor: '#080d1a',
          borderRadius: '16px',
          border: '1px solid #1a2a4a',
          padding: '20px',
        }}>
          <div style={{ fontSize: '11px', color: '#4488ff',
            letterSpacing: '3px', marginBottom: '20px',
            fontFamily: 'Share Tech Mono' }}>
            ◫ SYSTEM INFO
          </div>
          {[
            { label: 'PROJECT', value: 'Ring Guard AI Pro' },
            { label: 'VERSION', value: 'v1.0.0' },
            { label: 'HACKATHON', value: 'Amazon Dev 2026' },
            { label: 'TRACK', value: 'Ring + AWS Builder' },
            { label: 'DEVELOPER', value: 'Karthigeyan 🇱🇰' },
            { label: 'UPTIME', value: formatUptime(uptime) },
            { label: 'CONNECTION', value: status },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '10px 0',
              borderBottom: i < 6 ? '1px solid #0d1530' : 'none',
            }}>
              <span style={{ fontSize: '10px', color: '#2a3a5a',
                fontFamily: 'Share Tech Mono' }}>
                {item.label}
              </span>
              <span style={{ fontSize: '11px', color: '#4a5a7a',
                fontFamily: 'Share Tech Mono' }}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      backgroundColor: '#020510',
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'Share Tech Mono, monospace',
    }}>
      <style>{css}</style>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #060b18 0%, #080d1a 100%)',
        borderBottom: '1px solid #0d1530',
        padding: '16px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(10px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            fontSize: '22px',
            filter: 'drop-shadow(0 0 8px #4488ff)',
          }}>🛡️</div>
          <span style={{
            fontSize: '20px',
            fontWeight: '700',
            background: 'linear-gradient(90deg, #4488ff, #66aaff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '4px',
            fontFamily: 'Rajdhani, sans-serif',
          }}>
            RING GUARD AI
          </span>
          {['PRO v1.0', 'AMAZON HACKATHON 2026'].map(badge => (
            <span key={badge} style={{
              background: 'linear-gradient(135deg, #1a2a4a, #0d1a3a)',
              color: '#4488ff',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '10px',
              border: '1px solid #4488ff22',
              fontFamily: 'Share Tech Mono',
              letterSpacing: '1px',
            }}>
              {badge}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '16px', color: '#4488ff',
              fontFamily: 'Share Tech Mono',
              textShadow: '0 0 10px #4488ff44' }}>
              {currentTime}
            </div>
            <div style={{ fontSize: '9px', color: '#2a3a5a',
              fontFamily: 'Share Tech Mono', marginTop: '2px' }}>
              {currentDate}
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: status === 'LIVE'
              ? 'linear-gradient(135deg, rgba(46,213,115,0.1), rgba(0,170,68,0.05))'
              : 'rgba(255,71,87,0.1)',
            border: `1px solid ${status === 'LIVE' ? '#2ed57333' : '#ff475733'}`,
            padding: '8px 16px',
            borderRadius: '20px',
            boxShadow: status === 'LIVE'
              ? '0 0 15px rgba(46,213,115,0.15)'
              : 'none',
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              backgroundColor: status === 'LIVE' ? '#2ed573' : '#ff4757',
              animation: 'pulse 1.5s infinite',
              boxShadow: status === 'LIVE'
                ? '0 0 8px #2ed573' : '0 0 8px #ff4757',
            }}/>
            <span style={{
              fontSize: '12px',
              color: status === 'LIVE' ? '#2ed573' : '#ff4757',
              fontFamily: 'Share Tech Mono',
              letterSpacing: '2px',
            }}>
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '12px 28px',
        borderBottom: '1px solid #0d1530',
        background: 'linear-gradient(180deg, #060b18, #050810)',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className="tab-btn"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              fontSize: '10px',
              letterSpacing: '2px',
              border: activeTab === tab.id
                ? '1px solid #4488ff44'
                : '1px solid transparent',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, rgba(68,136,255,0.15), rgba(68,136,255,0.05))'
                : 'transparent',
              color: activeTab === tab.id ? '#4488ff' : '#2a3a5a',
              boxShadow: activeTab === tab.id
                ? '0 0 15px rgba(68,136,255,0.1)' : 'none',
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '24px 28px' }}>
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
        {activeTab === 'visitors' && <VisitorsTab />}
        {activeTab === 'notifications' && <AlertsTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '1px solid #0d1530',
        padding: '12px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '10px',
        color: '#1a2a4a',
        fontFamily: 'Share Tech Mono',
        background: 'linear-gradient(180deg, #050810, #030608)',
      }}>
        <span>⬡ RING GUARD AI PRO — AMAZON DEVELOPER HACKATHON 2026</span>
        <span>BUILT BY KARTHIGEYAN 🇱🇰 — SRI LANKA</span>
      </div>
    </div>
  );
}

export default App;