import React, { useState } from 'react';
import { Header } from './components/Header';
import { VsatToolkitView } from './components/VsatToolkitView';
import { AegisSecurityView } from './components/AegisSecurityView';
import { NebulaQuantumView } from './components/NebulaQuantumView';
import { TitanPEPSView } from './components/TitanPEPSView';
import { HyperionExascaleView } from './components/HyperionExascaleView';
import { CodeVaultView } from './components/CodeVaultView';
import { DocumentationView } from './components/DocumentationView';
import { AppTrack } from './types';
import { CREATIONS_ARCHIVE, VALIDATION_TEST_SUITE } from './data/creationsData';
import { Shield, Cpu, Code, BookOpen, Radio, Sparkles, Grid } from 'lucide-react';

export default function App() {
  const [activeTrack, setActiveTrack] = useState<AppTrack>('defense');
  const [activeDefenseSub, setActiveDefenseSub] = useState<'vsat' | 'aegis'>('vsat');
  const [activeQuantumSub, setActiveQuantumSub] = useState<'nebula' | 'titan' | 'hyperion'>('nebula');

  // Shared platform telemetry state
  const [pqcKeysCount, setPqcKeysCount] = useState(14);
  const [blockedThreatsCount, setBlockedThreatsCount] = useState(128);
  const [entropyBits, setEntropyBits] = useState(14.39);

  const handleDownloadAll = () => {
    const all = [...CREATIONS_ARCHIVE, VALIDATION_TEST_SUITE];
    all.forEach((item, index) => {
      setTimeout(() => {
        const mimeMap: Record<string, string> = {
          html: 'text/html;charset=utf-8',
          python: 'text/x-python;charset=utf-8',
          bash: 'application/x-sh;charset=utf-8'
        };
        const blob = new Blob([item.code], { type: mimeMap[item.language] || 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.filename;
        a.click();
        URL.revokeObjectURL(url);
      }, index * 250);
    });
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Top Navigation & Status Telemetry */}
      <Header
        activeTrack={activeTrack}
        onSelectTrack={setActiveTrack}
        onDownloadAll={handleDownloadAll}
        pqcKeysCount={pqcKeysCount}
        blockedThreatsCount={blockedThreatsCount}
        entropyBits={entropyBits}
      />

      {/* Sub-Navigation for Defense and Quantum Tracks */}
      {activeTrack === 'defense' && (
        <div className="border-b border-slate-800 bg-slate-950/60 py-2.5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-mono">Defense Subsystem:</span>
              <button
                onClick={() => setActiveDefenseSub('vsat')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  activeDefenseSub === 'vsat'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Radio className="h-3.5 w-3.5" />
                <span>VSAT Blue Team Toolkit v2.0</span>
              </button>

              <button
                onClick={() => setActiveDefenseSub('aegis')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  activeDefenseSub === 'aegis'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="h-3.5 w-3.5" />
                <span>Project AEGIS Ultimate Live SOC</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              FIPS 140-3 &bull; NIST 800-53 Rev 5 &bull; NSA 2026 Hardening
            </span>
          </div>
        </div>
      )}

      {activeTrack === 'quantum' && (
        <div className="border-b border-slate-800 bg-slate-950/60 py-2.5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-mono">Simulator Architecture:</span>
              <button
                onClick={() => setActiveQuantumSub('nebula')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  activeQuantumSub === 'nebula'
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Cpu className="h-3.5 w-3.5" />
                <span>Project Nebula (1D MPS)</span>
              </button>

              <button
                onClick={() => setActiveQuantumSub('titan')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  activeQuantumSub === 'titan'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Grid className="h-3.5 w-3.5" />
                <span>Project Titan (2D PEPS &amp; Ray)</span>
              </button>

              <button
                onClick={() => setActiveQuantumSub('hyperion')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  activeQuantumSub === 'hyperion'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Project Hyperion (Exascale BMPS &amp; Tests)</span>
              </button>
            </div>

            <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
              GBS Spoofing &bull; SVD Truncation &bull; Von Neumann Entropy
            </span>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTrack === 'defense' && (
          activeDefenseSub === 'vsat' ? (
            <VsatToolkitView />
          ) : (
            <AegisSecurityView
              pqcKeysCount={pqcKeysCount}
              onIncrementPqcKey={() => setPqcKeysCount(prev => prev + 1)}
              blockedThreatsCount={blockedThreatsCount}
              onIncrementBlockedThreat={() => setBlockedThreatsCount(prev => prev + 1)}
            />
          )
        )}

        {activeTrack === 'quantum' && (
          activeQuantumSub === 'nebula' ? (
            <NebulaQuantumView />
          ) : activeQuantumSub === 'titan' ? (
            <TitanPEPSView />
          ) : (
            <HyperionExascaleView
              currentEntropy={entropyBits}
              onUpdateEntropy={setEntropyBits}
            />
          )
        )}

        {activeTrack === 'vault' && (
          <CodeVaultView />
        )}

        {activeTrack === 'docs' && (
          <DocumentationView />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            <span className="text-slate-300 font-medium">Apex Quantum &amp; Cyber Defense Monolith Suite</span>
            <span>&bull; v2.0 (2026 Production Specification)</span>
          </div>

          <div className="flex items-center space-x-4">
            <button onClick={() => setActiveTrack('vault')} className="hover:text-slate-300 transition">
              Code Vault (6 Deliverables)
            </button>
            <button onClick={() => setActiveTrack('docs')} className="hover:text-slate-300 transition">
              Theoretical Whitepapers
            </button>
            <button onClick={handleDownloadAll} className="text-emerald-400 hover:text-emerald-300 transition font-semibold">
              Batch Download All Files
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
