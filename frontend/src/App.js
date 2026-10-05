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
  const [threatScore, setThreatScore] = useState(10);
  const ws = useRef(null);

  // Real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // WebSocket
  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/ws');
    ws.current.onopen = () => setStatus('LIVE');
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'analysis') {
        setThreatLevel(data.data.threat_level);
        setPeopleCount(data.data.people_count);
        setPackageDetected(data.data.package_detected);
        setDescription(data.data.description);
        setCurrentFrame(data.frame);
        setThreatScore(
          data.data.threat_level === 'HIGH' ? 90 :
          data.data.threat_level === 'MEDIUM' ? 50 : 10
        );
        setEvents(prev => [{
          time: new Date().toLocaleTimeString(),
          threat: data.data.threat_level,
          description: data.data.description,
          people: data.data.people_count
        }, ...prev.slice(0, 9)]);
      }
    };
    ws.current.onclose = () => setStatus('OFFLINE');
    return () => ws.current.close();
  }, []);

  const getThreatColor = (level) => {
    if (level === 'HIGH') return '#ff3333';
    if (level === 'MEDIUM') return '#ffaa00';
    return '#00dd66';
  };

  const getThreatBg = (level) => {
    if (level === 'HIGH') return 'rgba(255,51,51,0.1)';
    if (level === 'MEDIUM') return 'rgba(255,170,0,0.1)';
    return 'rgba(0,221,102,0.1)';
  };

  const styles = {
    app: {
      backgroundColor: '#050810',
      minHeight: '100vh',
      color: 'white',
      fontFamily: "'Courier New', monospace",
      padding: '0',
    },
    header: {
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0d1530 100%)',
      borderBottom: '1px solid #1a2a4a',
      padding: '15px 25px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    logo: {
      fontSize: '22px',
      fontWeight: 'bold',
      color: '#4488ff',
      letterSpacing: '2px',
    },
    badge: {
      backgroundColor: '#1a2a4a',
      color: '#4488ff',
      padding: '3px 10px',
      borderRadius: '4px',
      fontSize: '11px',
      border: '1px solid #4488ff33',
    },
    statusBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: status === 'LIVE' ? 'rgba(0,221,102,0.1)' : 'rgba(255,51,51,0.1)',
      border: `1px solid ${status === 'LIVE' ? '#00dd66' : '#ff3333'}`,
      padding: '6px 15px',
      borderRadius: '20px',
      fontSize: '13px',
      color: status === 'LIVE' ? '#00dd66' : '#ff3333',
    },
    dot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: status === 'LIVE' ? '#00dd66' : '#ff3333',
      animation: status === 'LIVE' ? 'pulse 1.5s infinite' : 'none',
    },
    main: {
      padding: '20px 25px',
      display: 'grid',
      gridTemplateColumns: '1.5fr 1fr',
      gap: '20px',
    },
    card: {
      backgroundColor: '#0a0f1e',
      borderRadius: '12px',
      border: '1px solid #1a2a4a',
      padding: '18px',
    },
    cardTitle: {
      fontSize: '11px',
      color: '#4488ff',
      letterSpacing: '3px',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    cameraBox: {
      backgroundColor: '#020408',
      borderRadius: '8px',
      height: '280px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      border: '1px solid #1a2a4a',
      position: 'relative',
    },
    threatCard: {
      backgroundColor: getThreatBg(threatLevel),
      borderRadius: '12px',
      border: `1px solid ${getThreatColor(threatLevel)}44`,
      padding: '18px',
      textAlign: 'center',
      marginBottom: '15px',
    },
    threatLabel: {
      fontSize: '10px',
      color: '#888',
      letterSpacing: '3px',
      marginBottom: '8px',
    },
    threatValue: {
      fontSize: '36px',
      fontWeight: 'bold',
      color: getThreatColor(threatLevel),
      letterSpacing: '4px',
    },
    meterBar: {
      height: '6px',
      backgroundColor: '#1a2a4a',
      borderRadius: '3px',
      marginTop: '12px',
      overflow: 'hidden',
    },
    meterFill: {
      height: '100%',
      width: `${threatScore}%`,
      backgroundColor: getThreatColor(threatLevel),
      borderRadius: '3px',
      transition: 'width 0.5s ease',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '10px',
      marginBottom: '15px',
    },
    statCard: {
      backgroundColor: '#0a0f1e',
      border: '1px solid #1a2a4a',
      borderRadius: '10px',
      padding: '12px',
      textAlign: 'center',
    },
    statLabel: {
      fontSize: '10px',
      color: '#666',
      letterSpacing: '2px',
      marginBottom: '6px',
    },
    statValue: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#4488ff',
    },
    descCard: {
      backgroundColor: '#0a0f1e',
      border: '1px solid #1a2a4a',
      borderRadius: '10px',
      padding: '12px',
    },
    eventItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '10px',
      borderBottom: '1px solid #0d1530',
      fontSize: '12px',
    },
    eventDot: (level) => ({
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: getThreatColor(level),
      flexShrink: 0,
    }),
    footer: {
      borderTop: '1px solid #1a2a4a',
      padding: '10px 25px',
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: '11px',
      color: '#333',
    }
  };

  return (
    <div style={styles.app}>
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.3; }
          100% { opacity: 1; }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0f1e; }
        ::-webkit-scrollbar-thumb { background: #1a2a4a; }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <span style={{ fontSize: '20px' }}>🛡️</span>
          <span style={styles.logo}>RING GUARD AI</span>
          <span style={styles.badge}>PRO v1.0</span>
          <span style={styles.badge}>AMAZON HACKATHON 2026</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#666', fontSize: '13px' }}>🕐 {currentTime}</span>
          <div style={styles.statusBadge}>
            <div style={styles.dot}></div>
            {status}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div style={styles.main}>

        {/* Left — Camera */}
        <div>
          <div style={styles.card}>
            <div style={styles.cardTitle}>
              📷 LIVE CAMERA FEED
            </div>
            <div style={styles.cameraBox}>
              {currentFrame ? (
                <img
                  src={`data:image/jpeg;base64,${currentFrame}`}
                  alt="Live Feed"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#333' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📷</div>
                  <div style={{ fontSize: '12px', letterSpacing: '2px' }}>
                    WAITING FOR CAMERA...
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Event Log */}
          <div style={{ ...styles.card, marginTop: '20px' }}>
            <div style={styles.cardTitle}>
              📋 RECENT EVENTS
            </div>
            {events.length === 0 ? (
              <div style={{ color: '#333', textAlign: 'center',
                padding: '20px', fontSize: '12px', letterSpacing: '2px' }}>
                NO EVENTS YET...
              </div>
            ) : (
              events.map((event, index) => (
                <div key={index} style={styles.eventItem}>
                  <div style={styles.eventDot(event.threat)}></div>
                  <span style={{ color: '#555', minWidth: '80px' }}>
                    {event.time}
                  </span>
                  <span style={{
                    color: getThreatColor(event.threat),
                    minWidth: '70px',
                    fontSize: '11px',
                    letterSpacing: '1px'
                  }}>
                    {event.threat}
                  </span>
                  <span style={{ color: '#aaa', flex: 1 }}>
                    {event.description}
                  </span>
                  <span style={{ color: '#4488ff' }}>
                    👤 {event.people}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right — Stats */}
        <div>
          {/* Threat Level */}
          <div style={styles.threatCard}>
            <div style={styles.threatLabel}>⚠️ THREAT LEVEL</div>
            <div style={styles.threatValue}>{threatLevel}</div>
            <div style={styles.meterBar}>
              <div style={styles.meterFill}></div>
            </div>
            <div style={{ fontSize: '11px', color: '#555',
              marginTop: '8px', letterSpacing: '1px' }}>
              SCORE: {threatScore}/100
            </div>
          </div>

          {/* Stats */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>👤 PEOPLE</div>
              <div style={styles.statValue}>{peopleCount}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>📦 PACKAGE</div>
              <div style={{
                ...styles.statValue,
                fontSize: '16px',
                color: packageDetected ? '#00dd66' : '#333',
                marginTop: '4px'
              }}>
                {packageDetected ? '✅ YES' : '❌ NO'}
              </div>
            </div>
          </div>

          {/* AI Description */}
          <div style={styles.descCard}>
            <div style={{ fontSize: '10px', color: '#4488ff',
              letterSpacing: '3px', marginBottom: '10px' }}>
              🤖 AI ANALYSIS
            </div>
            <div style={{ fontSize: '13px', color: '#aaa',
              lineHeight: '1.6' }}>
              {description}
            </div>
          </div>

          {/* AWS Badge */}
          <div style={{
            ...styles.card,
            marginTop: '15px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, #0a0f1e, #0d1a0d)'
          }}>
            <div style={{ fontSize: '11px', color: '#666',
              letterSpacing: '2px', marginBottom: '8px' }}>
              POWERED BY
            </div>
            <div style={{ display: 'flex',
              justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {['AWS BEDROCK', 'RING API', 'ALEXA+'].map(tech => (
                <span key={tech} style={{
                  backgroundColor: '#0d2010',
                  color: '#00dd66',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  border: '1px solid #00dd6633',
                  letterSpacing: '1px'
                }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <span>🛡️ RING GUARD AI PRO — AMAZON DEVELOPER HACKATHON 2026</span>
        <span>Built by Karthigeyan 🇱🇰</span>
      </div>
    </div>
  );
}

export default App;