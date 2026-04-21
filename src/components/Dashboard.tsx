import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Terminal, 
  Database, 
  Code2,
  Box,
  Settings2,
  Clock,
  Cpu,
  ShieldCheck,
  Activity,
  HardDrive,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FileData {
  name: string;
  content: string;
}

interface Metrics {
  version: string;
  rows_processed: number;
  metric: string;
  value: number;
  latency_ms: number;
  seed: number;
  status: string;
  error_message?: string;
}

export default function Dashboard() {
  const [files, setFiles] = useState<FileData[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/files')
      .then(res => res.json())
      .then(data => setFiles(data));
  }, []);

  const runJob = async () => {
    setIsRunning(true);
    setMetrics(null);
    setLogs([]);
    
    const initialLogs = [
      "Job started",
      "Config loaded and validated: version=v1, seed=42, window=5",
      "Rows loaded: 10000",
      "Starting processing: rolling mean and signal generation",
      "Computing rolling averages...",
      "Generating trade signals...",
      "Calculating metrics...",
    ];

    for (const line of initialLogs) {
      await new Promise(r => setTimeout(r, 200));
      setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - INFO - ${line}`]);
    }

    try {
      const res = await fetch('/api/run-job', { method: 'POST' });
      const data = await res.json();
      setMetrics(data.metrics);
      setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - INFO - Job ended with status: success`]);
    } catch (error) {
      setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ERROR - Failed to execute batch process`]);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-screen bg-[#050505] text-[#e0e0e0] font-sans flex flex-col border-8 border-[#1a1a1a] overflow-hidden">
      {/* Header Section */}
      <header className="h-16 border-b border-[#222] bg-[#0a0a0a] flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#00FF41] rounded-sm flex items-center justify-center text-black font-bold text-xs shadow-[0_0_15px_rgba(0,255,65,0.3)]">T0</div>
          <div>
            <h1 className="text-sm font-semibold tracking-widest uppercase">MLOps-style batch job</h1>
            <p className="text-[10px] text-[#666] uppercase tracking-tighter italic">System: MetaStackerBandit / Pipeline: Trading-Signal-V1</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <p className="text-[10px] text-[#666] uppercase">Environment</p>
            <p className="text-xs font-mono text-[#00FF41]">DOCKER_CONTAINER_PROD</p>
          </div>
          <div className="h-8 w-px bg-[#222]"></div>
          <div className="text-right">
            <p className="text-[10px] text-[#666] uppercase">Execution State</p>
            <p className="text-xs font-mono text-white uppercase">{isRunning ? 'Running...' : metrics ? 'Complete' : 'Idle'}</p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Rail: Configuration */}
        <aside className="w-64 border-r border-[#222] bg-[#080808] flex flex-col p-4 gap-6 shrink-0 overflow-y-auto">
          <section>
            <h2 className="text-[10px] uppercase tracking-widest text-[#666] mb-3 flex items-center gap-2">
              <Settings2 className="w-3 h-3" /> config.yaml
            </h2>
            <div className="bg-[#000] p-3 rounded border border-[#222] font-mono text-[11px] leading-relaxed">
              <p><span className="text-[#FF6B6B]">seed</span>: <span className="text-[#4ECDC4]">42</span></p>
              <p><span className="text-[#FF6B6B]">window</span>: <span className="text-[#4ECDC4]">5</span></p>
              <p><span className="text-[#FF6B6B]">version</span>: <span className="text-[#4ECDC4]">"v1"</span></p>
            </div>
          </section>
          
          <section>
            <h2 className="text-[10px] uppercase tracking-widest text-[#666] mb-3 flex items-center gap-2">
              <Activity className="w-3 h-3" /> Input Manifest
            </h2>
            <div className="space-y-2">
              {[
                { label: 'Source', value: 'data.csv' },
                { label: 'Rows', value: '10,000' },
                { label: 'Columns', value: 'OHLCV' },
                { label: 'Target', value: 'close' }
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center text-[11px]">
                  <span className="text-[#999]">{item.label}</span>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-auto">
            <div className={`p-4 rounded border transition-colors ${isRunning ? 'border-[#00FF41]/40 bg-[#00FF41]/10' : 'border-[#222] bg-[#111]'}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#00FF41] animate-pulse' : 'bg-[#444]'}`}></div>
                <span className={`text-[10px] uppercase font-bold ${isRunning ? 'text-[#00FF41]' : 'text-[#666]'}`}>Job {isRunning ? 'Active' : 'Standby'}</span>
              </div>
              <p className="text-[10px] text-[#999] leading-tight">Worker nodes initialized. Local volume mounted to /app/data.</p>
            </div>
          </section>
        </aside>

        {/* Central Panel: Terminal and Metrics */}
        <section className="flex-1 flex flex-col bg-[#050505] overflow-hidden">
          {/* Command Runner */}
          <div className="bg-[#111] p-2 px-4 border-b border-[#222] flex items-center justify-between shrink-0">
            <div className="font-mono text-[11px] text-[#00FF41] flex items-center gap-2">
              <span className="opacity-50 tracking-tighter">$</span> 
              <span>docker run --rm mlops-task --input data.csv --config config.yaml</span>
            </div>
            <div className="flex gap-1.5 opacity-40">
              <div className="w-2 h-2 rounded-full bg-[#eee]"></div>
              <div className="w-2 h-2 rounded-full bg-[#eee]"></div>
              <div className="w-2 h-2 rounded-full bg-[#eee]"></div>
            </div>
          </div>

          {/* Main Visualizers */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Metrics Output Block */}
              <div className="flex flex-col gap-2 relative group">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] uppercase tracking-widest text-[#666] flex items-center gap-2">
                    <Box className="w-3 h-3" /> metrics.json [Output]
                  </h3>
                  <span className="text-[10px] bg-[#00FF41]/10 text-[#00FF41] px-2 py-0.5 rounded border border-[#00FF41]/20">VALID_JSON</span>
                </div>
                <div className="flex-1 bg-[#000] p-5 rounded border border-[#222] shadow-inner min-h-[180px]">
                  {metrics ? (
                    <motion.pre 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="font-mono text-xs leading-relaxed text-[#4ECDC4]"
                    >
                      {JSON.stringify(metrics, null, 2)}
                    </motion.pre>
                  ) : (
                    <div className="h-full flex items-center justify-center text-[#444] font-mono text-[10px] uppercase">
                      Waiting for process output...
                    </div>
                  )}
                </div>
              </div>

              {/* Statistical Overview */}
              <div className="flex flex-col gap-2">
                <h3 className="text-[10px] uppercase tracking-widest text-[#666] flex items-center gap-2">
                  <Cpu className="w-3 h-3" /> Statistical Overview
                </h3>
                <div className="flex-1 bg-[#0a0a0a] border border-[#222] rounded p-6 flex flex-col justify-between min-h-[180px]">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-[#666] mb-1">Signal Rate</p>
                      <p className="text-4xl font-light text-white tracking-tighter">
                        {metrics ? (metrics.value * 100).toFixed(2) : '00.00'}<span className="text-lg opacity-40 ml-1">%</span>
                      </p>
                    </div>
                    {metrics && (
                      <div className="bg-[#00FF41]/10 text-[#00FF41] p-2 rounded border border-[#00FF41]/20">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  
                  {/* Histogram Visualizer Pattern */}
                  <div className="h-12 w-full flex items-end gap-1 px-1">
                    {[0.6, 0.4, 0.8, 0.5, 0.9, 0.2, 0.7, 0.4, 0.6, 0.3].map((height, i) => (
                      <motion.div 
                        key={i}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: metrics ? 1 : 0.2 }}
                        style={{ height: `${height * 100}%` }}
                        className={`bg-[#00FF41] w-full rounded-t-sm origin-bottom transition-opacity ${metrics ? 'opacity-100' : 'opacity-20'}`}
                      ></motion.div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-4 border-t border-[#222] pt-4">
                    <div>
                      <p className="text-[9px] text-[#666] uppercase">Latency</p>
                      <p className="text-sm font-mono">{metrics ? `${metrics.latency_ms}ms` : '---'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-[#666] uppercase">Deterministic</p>
                      <p className={`text-sm font-mono ${metrics ? 'text-[#00FF41]' : 'text-[#444]'}`}>{metrics ? 'TRUE' : 'WAIT'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logs Area */}
            <div className="flex-1 flex flex-col gap-2 min-h-[200px]">
              <h3 className="text-[10px] uppercase tracking-widest text-[#666] flex items-center justify-between">
                <span className="flex items-center gap-2"><Terminal className="w-3 h-3" /> run.log [Tail -n 10]</span>
                {isRunning && <span className="text-[#00FF41] animate-pulse">STREAMING_LIVE</span>}
              </h3>
              <div className="flex-1 bg-[#000] border border-[#222] rounded overflow-hidden font-mono text-[10px] flex flex-col shadow-inner">
                <div className="p-4 overflow-y-auto space-y-1.5 h-full scrollbar-thin scrollbar-thumb-[#222]">
                  {logs.map((log, i) => {
                    const parts = log.split(' - ');
                    return (
                      <div key={i} className="flex gap-3 leading-tight opacity-80 hover:opacity-100 transition-opacity">
                        <span className="text-[#555] shrink-0">[{parts[0]}]</span>
                        <span className={parts[1] === 'INFO' ? 'text-[#00FF41]' : 'text-red-500'}>{parts[1]}:</span>
                        <span className="text-[#bbb]">{parts[2]}</span>
                      </div>
                    );
                  })}
                  {isRunning && (
                    <div className="flex gap-2 text-[#00FF41] items-center italic">
                       <Clock className="w-3 h-3 animate-spin" />
                       <span>Processing computational cycles...</span>
                    </div>
                  )}
                  {logs.length === 0 && !isRunning && (
                    <div className="h-full flex items-center justify-center text-[#333] tracking-widest">SYSTEM_IDLE</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Right Sidebar: Docker Status */}
        <aside className="w-48 border-l border-[#222] bg-[#0a0a0a] p-4 flex flex-col shrink-0 overflow-y-auto z-10 shadow-[-10px_0_20px_rgba(0,0,0,0.3)]">
          <h2 className="text-[10px] uppercase tracking-widest text-[#666] mb-4">Runtime Engine</h2>
          <div className="space-y-6">
            <div>
              <p className="text-[9px] text-[#555] uppercase mb-2 italic">Container Image</p>
              <div className="bg-[#111] p-2 rounded text-[10px] font-mono truncate border border-[#222]">
                python:3.9-slim
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className={`w-1 h-12 rounded-full ${isRunning ? 'bg-orange-500' : metrics ? 'bg-[#00FF41]' : 'bg-[#333]'}`}></div>
              <div className="flex-1">
                <p className="text-[9px] text-[#555] uppercase tracking-widest">Core Health</p>
                <p className="text-xs font-semibold">{isRunning ? 'Occupied' : 'Ready'}</p>
                <div className="mt-2 w-full bg-[#222] h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    className="bg-[#00FF41] h-full"
                    initial={{ width: '0%' }}
                    animate={{ width: isRunning ? '95%' : '100%' }}
                  ></motion.div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#222]">
              <p className="text-[9px] text-[#555] uppercase mb-3 flex items-center gap-2">
                <Database className="w-3 h-3" /> Dependencies
              </p>
              <ul className="text-[10px] space-y-2 font-mono">
                {['numpy', 'pandas', 'pyyaml'].map(dep => (
                  <li key={dep} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-[#00FF41]"></div>
                    <span className="text-[#bbb]">{dep}</span>
                    <span className="text-[#00FF41] ml-auto text-[8px] opacity-40">INSTALLED</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto">
              <button 
                onClick={runJob}
                disabled={isRunning}
                className={`w-full p-4 rounded bg-white text-black font-bold text-center text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-opacity-90 active:scale-[0.98] ${isRunning ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {isRunning ? 'Running...' : 'Execute Job'}
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Footer Bar */}
      <footer className="h-8 bg-[#0a0a0a] border-t border-[#222] flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex gap-6 items-center">
          <div className="flex items-center gap-2">
             <Globe className="w-2.5 h-2.5 text-[#555]" />
             <span className="text-[9px] text-[#555] uppercase">Node: US-EAST-1A</span>
          </div>
          <div className="flex items-center gap-2">
             <HardDrive className="w-2.5 h-2.5 text-[#555]" />
             <span className="text-[9px] text-[#555] uppercase">IP: 10.0.4.192</span>
          </div>
        </div>
        <div className="text-[9px] text-[#555] uppercase font-mono">
          © 2026 PRIMETRADE AI SYSTEMS - SECURE BATCH RUNTIME
        </div>
      </footer>
    </div>
  );
}

