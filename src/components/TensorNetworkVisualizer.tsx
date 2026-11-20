import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Activity, AlertTriangle, RefreshCw, SlidersHorizontal } from 'lucide-react';

export interface TensorNodeMetric {
  id: number;
  label: string;
  physicalDim: number;
  localEntropy: number;
  status: 'HEALTHY' | 'COMPRESSED' | 'SATURATED';
}

export interface TensorLinkMetric {
  source: number;
  target: number;
  bondDim: number;
  maxBondDim: number;
  utilization: number;
  health: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  truncationLoss: number;
}

export interface TensorNetworkVisualizerProps {
  nodes: TensorNodeMetric[];
  links: TensorLinkMetric[];
  singularValueSpectrum: number[];
  bondHealthSummary: 'OPTIMAL' | 'MODERATE_COMPRESSION' | 'CRITICAL_SATURATION';
  bondSaturationRatio: number;
  noiseTolerance: number;
  numQubits: number;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRefresh?: () => void;
}

type InspectedItem =
  | { kind: 'node'; data: TensorNodeMetric }
  | { kind: 'link'; data: TensorLinkMetric }
  | null;

export const TensorNetworkVisualizer: React.FC<TensorNetworkVisualizerProps> = ({
  nodes,
  links,
  singularValueSpectrum,
  bondHealthSummary,
  bondSaturationRatio,
  noiseTolerance,
  numQubits,
  isLoading = false,
  errorMessage = null,
  onRefresh,
}) => {
  const topologySvgRef = useRef<SVGSVGElement | null>(null);
  const spectrumSvgRef = useRef<SVGSVGElement | null>(null);
  const [inspected, setInspected] = useState<InspectedItem>(null);

  // Render MPS Tensor Network Graph with D3.js
  useEffect(() => {
    const svgEl = topologySvgRef.current;
    if (!svgEl) return;

    const width = 760;
    const cols = Math.min(8, Math.max(2, nodes.length));
    const rows = Math.max(1, Math.ceil(nodes.length / cols));
    const rowHeight = 110;
    const height = Math.max(190, rows * rowHeight + 70);

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    if (nodes.length === 0) return;

    const marginX = 56;
    const marginY = 58;
    const usableW = width - marginX * 2;
    const stepX = cols > 1 ? usableW / (cols - 1) : 0;

    // Serpentine 1D MPS layout coordinates so up to 24 qubits fit crisply
    const positions = new Map<number, { x: number; y: number }>();
    nodes.forEach((node, idx) => {
      const row = Math.floor(idx / cols);
      const colInRow = idx % cols;
      const col = row % 2 === 0 ? colInRow : cols - 1 - colInRow;
      const x = cols === 1 ? width / 2 : marginX + col * stepX;
      const y = marginY + row * rowHeight;
      positions.set(node.id, { x, y });
    });

    const linkStrokeScale = d3
      .scaleLinear()
      .domain([1, Math.max(2, d3.max(links, (l) => l.maxBondDim) || 64)])
      .range([2.5, 11])
      .clamp(true);

    const healthColor = (health: TensorLinkMetric['health']) => {
      if (health === 'CRITICAL') return '#f43f5e';
      if (health === 'WARNING') return '#f59e0b';
      return '#10b981';
    };

    const nodeColor = (status: TensorNodeMetric['status']) => {
      if (status === 'SATURATED') return '#f43f5e';
      if (status === 'COMPRESSED') return '#f59e0b';
      return '#22d3ee';
    };

    // Background grid pattern
    const defs = svg.append('defs');
    const glow = defs.append('filter').attr('id', 'mps-glow');
    glow.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
    const feMerge = glow.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Draw virtual entanglement bonds
    const linksGroup = svg.append('g').attr('class', 'mps-links');
    links.forEach((link) => {
      const src = positions.get(link.source);
      const dst = positions.get(link.target);
      if (!src || !dst) return;

      const color = healthColor(link.health);
      const strokeW = linkStrokeScale(link.bondDim);
      const isRowTurn = Math.abs(src.y - dst.y) > 10;

      const pathData = isRowTurn
        ? `M ${src.x} ${src.y} C ${src.x + 35} ${src.y}, ${dst.x + 35} ${dst.y}, ${dst.x} ${dst.y}`
        : `M ${src.x} ${src.y} L ${dst.x} ${dst.y}`;

      const bondGroup = linksGroup
        .append('g')
        .style('cursor', 'pointer')
        .on('mouseenter', () => setInspected({ kind: 'link', data: link }))
        .on('click', () => setInspected({ kind: 'link', data: link }));

      bondGroup
        .append('path')
        .attr('d', pathData)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', strokeW)
        .attr('stroke-opacity', 0.85)
        .attr('filter', link.health === 'CRITICAL' ? 'url(#mps-glow)' : null);

      // Midpoint bond dimension badge
      const midX = isRowTurn ? src.x + 26 : (src.x + dst.x) / 2;
      const midY = (src.y + dst.y) / 2 - (isRowTurn ? 0 : 12);

      bondGroup
        .append('rect')
        .attr('x', midX - 15)
        .attr('y', midY - 9)
        .attr('width', 30)
        .attr('height', 16)
        .attr('rx', 4)
        .attr('fill', '#020617')
        .attr('stroke', color)
        .attr('stroke-width', 0.9);

      bondGroup
        .append('text')
        .attr('x', midX)
        .attr('y', midY + 2.5)
        .attr('text-anchor', 'middle')
        .attr('fill', color)
        .attr('font-size', '9px')
        .attr('font-family', 'ui-monospace, SFMono-Regular, monospace')
        .attr('font-weight', '700')
        .text(`χ${link.bondDim}`);
    });

    // Draw physical qubit legs and MPS site tensor nodes
    const nodesGroup = svg.append('g').attr('class', 'mps-nodes');
    nodes.forEach((node) => {
      const pos = positions.get(node.id);
      if (!pos) return;
      const color = nodeColor(node.status);

      const g = nodesGroup
        .append('g')
        .attr('transform', `translate(${pos.x}, ${pos.y})`)
        .style('cursor', 'pointer')
        .on('mouseenter', () => setInspected({ kind: 'node', data: node }))
        .on('click', () => setInspected({ kind: 'node', data: node }));

      // Physical qubit index leg (bottom vertical stub)
      g.append('line')
        .attr('x1', 0)
        .attr('y1', 14)
        .attr('x2', 0)
        .attr('y2', 32)
        .attr('stroke', '#64748b')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '3,2');

      g.append('text')
        .attr('x', 0)
        .attr('y', 43)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .attr('font-size', '9px')
        .attr('font-family', 'ui-monospace, SFMono-Regular, monospace')
        .text(`|σ${node.id}⟩`);

      // Tensor core node
      g.append('rect')
        .attr('x', -16)
        .attr('y', -16)
        .attr('width', 32)
        .attr('height', 32)
        .attr('rx', 7)
        .attr('fill', '#0f172a')
        .attr('stroke', color)
        .attr('stroke-width', 2.2)
        .attr('filter', 'url(#mps-glow)');

      g.append('text')
        .attr('x', 0)
        .attr('y', 3.5)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f8fafc')
        .attr('font-size', '10px')
        .attr('font-family', 'ui-monospace, SFMono-Regular, monospace')
        .attr('font-weight', '700')
        .text(`T${node.id}`);
    });
  }, [nodes, links]);

  // Render Singular Value Decay Spectrum Chart with D3.js
  useEffect(() => {
    const svgEl = spectrumSvgRef.current;
    if (!svgEl) return;

    const width = 760;
    const height = 135;
    const margin = { top: 14, right: 20, bottom: 26, left: 42 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    if (singularValueSpectrum.length === 0) return;

    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const x = d3
      .scaleBand<number>()
      .domain(singularValueSpectrum.map((_, i) => i))
      .range([0, innerW])
      .padding(0.24);

    const maxVal = Math.max(0.1, d3.max(singularValueSpectrum) || 1);
    const y = d3.scaleLinear().domain([0, maxVal]).nice().range([innerH, 0]);

    chart
      .append('g')
      .attr('transform', `translate(0, ${innerH})`)
      .call(
        d3
          .axisBottom(x)
          .tickFormat((i) => `λ${Number(i) + 1}`)
      )
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '9px');

    chart
      .append('g')
      .call(d3.axisLeft(y).ticks(3))
      .selectAll('text')
      .attr('fill', '#94a3b8')
      .attr('font-size', '9px');

    chart.selectAll('.domain, .tick line').attr('stroke', '#334155');

    // Bars colored relative to noise threshold
    chart
      .selectAll('rect.sv-bar')
      .data(singularValueSpectrum)
      .enter()
      .append('rect')
      .attr('class', 'sv-bar')
      .attr('x', (_, i) => x(i) ?? 0)
      .attr('y', (d) => y(d))
      .attr('width', x.bandwidth())
      .attr('height', (d) => Math.max(1, innerH - y(d)))
      .attr('rx', 3)
      .attr('fill', (d) => (d <= noiseTolerance * 10 ? '#f59e0b' : '#6366f1'));

    // Noise floor threshold guide line
    const clampedThreshold = Math.min(maxVal, noiseTolerance * 10);
    const thresholdY = y(clampedThreshold);
    chart
      .append('line')
      .attr('x1', 0)
      .attr('x2', innerW)
      .attr('y1', thresholdY)
      .attr('y2', thresholdY)
      .attr('stroke', '#10b981')
      .attr('stroke-width', 1.2)
      .attr('stroke-dasharray', '4,3');
  }, [singularValueSpectrum, noiseTolerance]);

  const healthBadgeClass =
    bondHealthSummary === 'CRITICAL_SATURATION'
      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
      : bondHealthSummary === 'MODERATE_COMPRESSION'
        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
        : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';

  return (
    <div className="p-5 rounded-xl border border-slate-800 bg-slate-950 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400" />
            Real-Time D3 Tensor Network State &amp; Bond Health Topology
          </h4>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Displaying {nodes.length} of {numQubits} MPS tensor sites &bull; Saturation Ratio:{' '}
            <span className="font-mono text-cyan-400">{(bondSaturationRatio * 100).toFixed(0)}%</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-md border font-mono text-[10px] font-bold ${healthBadgeClass}`}>
            {bondHealthSummary}
          </span>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs text-slate-300 transition disabled:opacity-50"
              title="Sync live backend tensor state"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>Backend telemetry warning: {errorMessage}</span>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400 border-b border-slate-800/80 pb-2">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 inline-block" />
            Bond Healthy (&lt;65%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" />
            Compressed (65–89%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" />
            Saturated (&ge;90% / Cap Hit)
          </span>
        </div>
        <span className="text-slate-500">Hover or click any tensor node or bond</span>
      </div>

      {/* D3 Topology SVG */}
      <div className="rounded-xl border border-slate-800/80 bg-[#050814] p-2 overflow-hidden">
        <svg ref={topologySvgRef} className="w-full h-auto block" />
      </div>

      {/* Live Inspected Node/Bond Detail Bar */}
      <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 text-xs font-mono flex flex-wrap items-center justify-between gap-2">
        {inspected?.kind === 'link' ? (
          <>
            <span className="text-cyan-400 font-semibold">
              Bond ({inspected.data.source} &harr; {inspected.data.target}): &chi; = {inspected.data.bondDim} / {inspected.data.maxBondDim}
            </span>
            <span className="text-slate-300">
              Utilization: {(inspected.data.utilization * 100).toFixed(1)}% &bull; Truncation Loss: {inspected.data.truncationLoss}
            </span>
            <span
              className={
                inspected.data.health === 'CRITICAL'
                  ? 'text-rose-400 font-bold'
                  : inspected.data.health === 'WARNING'
                    ? 'text-amber-400 font-bold'
                    : 'text-emerald-400 font-bold'
              }
            >
              {inspected.data.health}
            </span>
          </>
        ) : inspected?.kind === 'node' ? (
          <>
            <span className="text-cyan-400 font-semibold">
              Tensor Site T{inspected.data.id} ({inspected.data.label})
            </span>
            <span className="text-slate-300">
              Physical Dim: {inspected.data.physicalDim} &bull; Local Entropy: {inspected.data.localEntropy} bits
            </span>
            <span className="text-emerald-400 font-bold">{inspected.data.status}</span>
          </>
        ) : (
          <span className="text-slate-500 flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
            Select or hover a tensor node or virtual entanglement bond above to inspect SVD truncation telemetry.
          </span>
        )}
      </div>

      {/* D3 Singular Value Spectrum SVG */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>SVD Singular Value Spectrum (&lambda;₁ ... &lambda;<sub>{singularValueSpectrum.length}</sub>)</span>
          <span className="text-emerald-400">Dashed line: truncation threshold guide</span>
        </div>
        <div className="rounded-xl border border-slate-800/80 bg-[#050814] p-2 overflow-hidden">
          <svg ref={spectrumSvgRef} className="w-full h-auto block" />
        </div>
      </div>
    </div>
  );
};
