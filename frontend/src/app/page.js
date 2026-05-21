'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

export default function Home() {
  const [status, setStatus] = useState('checking'); // checking, online, offline
  const [logs, setLogs] = useState([]);
  const [systemData, setSystemData] = useState(null);
  const [staticFiles, setStaticFiles] = useState([]);
  const consoleEndRef = useRef(null);

  const addLog = (message, type = 'system') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  const checkBackendStatus = async (isManual = false) => {
    if (isManual) {
      addLog('Initiating manual connection check to API...', 'system');
      setStatus('checking');
    }

    try {
      const response = await fetch('http://localhost:5200/api/status');
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      setStatus('online');
      setSystemData(data);
      
      // Update list of files in backend static folder
      if (data.staticDirInfo && data.staticDirInfo.files) {
        setStaticFiles(data.staticDirInfo.files);
      }

      if (isManual) {
        addLog(`Connected successfully. Backend running on port ${data.port}.`, 'success');
      } else {
        addLog(`API Handshake completed. System online.`, 'success');
      }
    } catch (error) {
      setStatus('offline');
      setSystemData(null);
      setStaticFiles([]);
      addLog(`Connection failed: ${error.message}. Ensure backend is running.`, 'error');
    }
  };

  const createTestFile = async () => {
    addLog('Requesting file creation in backend static/ directory...', 'system');
    
    try {
      const response = await fetch('http://localhost:5200/api/static/create-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: `demo-${Date.now().toString().slice(-6)}.json` })
      });
      
      if (!response.ok) {
        throw new Error('Failed to create file');
      }
      
      const result = await response.json();
      addLog(`File successfully created on backend: ${result.file}`, 'success');
      
      // Re-trigger status check to get updated files list
      checkBackendStatus(false);
    } catch (error) {
      addLog(`Write operation failed: ${error.message}`, 'error');
    }
  };

  // Initial check
  useEffect(() => {
    addLog('System dashboard initialized. Handshaking with local gateway...', 'system');
    checkBackendStatus();
    
    // Auto refresh every 10 seconds
    const interval = setInterval(() => {
      checkBackendStatus();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom of console
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Format memory helper
  const formatMemory = (bytes) => {
    if (!bytes) return 'N/A';
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logo}>U</div>
          <div>
            <h1 className={styles.brandTitle}>Unified Control Panel</h1>
            <span className={styles.badge}>Next.js + Node + Compose</span>
          </div>
        </div>

        <div className={styles.serverStatus}>
          <span className={`${styles.statusIndicator} ${styles[status]}`}></span>
          <span>API Status: <strong>{status.toUpperCase()}</strong></span>
        </div>
      </header>

      <main className={styles.grid}>
        {/* Left Side: System Control & Console logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              Operations Center
            </h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Interact with the container backend network, run diagnostic tests, and dynamically write files directly to the ignored backend <code style={{color: 'hsl(var(--primary))'}}>static/</code> directory.
            </p>
            
            <div className={styles.actionsRow}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => checkBackendStatus(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
                Ping API Gateway
              </button>
              <button 
                className={`${styles.btn} ${styles.btnSecondary}`} 
                onClick={createTestFile}
                disabled={status !== 'online'}
                style={{ opacity: status !== 'online' ? 0.5 : 1, cursor: status !== 'online' ? 'not-allowed' : 'pointer' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                Create Static File
              </button>
            </div>

            <div className={styles.console}>
              {logs.map((log, index) => (
                <div key={index} className={styles.consoleLine}>
                  <span className={styles.consoleTime}>[{log.timestamp}]</span>
                  <span className={`${styles.consoleOutput} ${styles[log.type]}`}>
                    {log.type === 'system' ? '➜ ' : log.type === 'success' ? '✔ ' : '✖ '}
                    {log.message}
                  </span>
                </div>
              ))}
              <div ref={consoleEndRef} />
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
              Live Telemetry
            </h2>
            <div className={styles.statsGrid}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Connection Uptime</span>
                <span className={styles.statVal}>
                  {systemData ? `${Math.floor(systemData.uptime)}s` : '--'}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Active Port</span>
                <span className={styles.statVal}>
                  {systemData ? systemData.port : '--'}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Node Environment</span>
                <span className={styles.statVal} style={{ fontSize: '1rem', textTransform: 'capitalize' }}>
                  {systemData ? systemData.environment : '--'}
                </span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Server Heap Allocated</span>
                <span className={styles.statVal} style={{ fontSize: '1rem' }}>
                  {systemData ? formatMemory(systemData.system.memoryUsage.heapUsed) : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Ignores static folder inspection */}
        <div>
          <div className={styles.card} style={{ height: '100%' }}>
            <h2 className={styles.cardTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              Ignored Dynamic Storage
            </h2>
            <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Files listed below are stored inside the backend's <code style={{color:'hsl(var(--primary))'}}>static/</code> folder. 
              These files are fully operational locally but are excluded from version control and Git tracking.
            </p>

            <div style={{ padding: '0.75rem 1rem', background: 'hsl(var(--bg-surface))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '0.8125rem', color: 'hsl(var(--text-muted))', marginBottom: '1.5rem' }}>
              <strong>Status:</strong> Excluded in <code style={{color: 'hsl(var(--secondary))'}}>.gitignore</code> & <code style={{color: 'hsl(var(--secondary))'}}>.dockerignore</code>
            </div>

            {staticFiles.length > 0 ? (
              <div className={styles.fileList}>
                {staticFiles.map((file, i) => (
                  <div key={i} className={styles.fileItem}>
                    <div className={styles.fileInfo}>
                      <span className={styles.fileIcon}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                      </span>
                      <span className={styles.fileName}>{file}</span>
                    </div>
                    <a 
                      href={`http://localhost:5200/static/${file}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.fileLink}
                    >
                      View Raw
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
                </span>
                <p className={styles.emptyText}>No files detected inside backend/static/</p>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.5rem', maxWidth: '200px' }}>
                  Click <strong>Create Static File</strong> to dynamically write one to disk!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Unified Project Monorepo Structure &bull; Core Platform <strong>Antigravity Engine</strong></p>
      </footer>
    </div>
  );
}
