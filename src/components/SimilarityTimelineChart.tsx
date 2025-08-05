
import React, { useState, useRef } from 'react';
import type { TimelinePoint } from '../types';

interface SimilarityTimelineChartProps {
  timeline: TimelinePoint[];
}

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const SimilarityTimelineChart: React.FC<SimilarityTimelineChartProps> = ({ timeline }) => {
    const [activePoint, setActivePoint] = useState<TimelinePoint | null>(null);
    const [mousePos, setMousePos] = useState<{x: number, y: number} | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);

    if (!timeline || timeline.length < 2) {
        return (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 mt-6">
                 <h3 className="font-bold text-lg text-fuchsia-400 mb-4">Similarity Timeline</h3>
                 <p className="text-slate-400">Not enough data to display timeline.</p>
            </div>
        );
    }

    const svgWidth = 500;
    const svgHeight = 160;
    const padding = { top: 20, right: 20, bottom: 40, left: 30 };
    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;
    const maxTime = timeline[timeline.length - 1].timestamp;

    const xScale = (time: number) => padding.left + (time / maxTime) * chartWidth;
    const yScale = (similarity: number) => padding.top + chartHeight - (similarity / 100) * chartHeight;

    const linePath = timeline.map(p => `${xScale(p.timestamp)},${yScale(p.similarity)}`).join(' ');
    const areaBottomY = padding.top + chartHeight;
    const areaPath = `M${xScale(timeline[0].timestamp)},${areaBottomY} L${linePath} L${xScale(maxTime)},${areaBottomY} Z`;

    const timeLabels = [];
    const numLabels = 5;
    for (let i = 0; i <= numLabels; i++) {
        const time = (maxTime / numLabels) * i;
        timeLabels.push({
            time: formatTime(Math.round(time)),
            x: xScale(time),
        });
    }

    const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
        if (!svgRef.current) return;
        const svgRect = svgRef.current.getBoundingClientRect();
        const svgX = event.clientX - svgRect.left;
        const svgY = event.clientY - svgRect.top;
        
        const timeAtMouse = (svgX - padding.left) / chartWidth * maxTime;

        // Find the closest point in the timeline
        const closestPoint = timeline.reduce((prev, curr) => 
            Math.abs(curr.timestamp - timeAtMouse) < Math.abs(prev.timestamp - timeAtMouse) ? curr : prev
        );
        
        setActivePoint(closestPoint);
        setMousePos({ x: svgX, y: svgY });
    };

    const handleMouseLeave = () => {
        setActivePoint(null);
        setMousePos(null);
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 mt-6">
            <h3 className="font-bold text-lg text-fuchsia-400 mb-4">Similarity Timeline</h3>
            <div className="w-full overflow-x-auto relative">
                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                    className="min-w-[500px] cursor-crosshair"
                    aria-labelledby="chart-title"
                    role="img"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                    <title id="chart-title">An interactive chart showing song similarity over time. Hover to see details.</title>
                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgb(134 25 143)" stopOpacity="0.6" />
                            <stop offset="100%" stopColor="rgb(14 116 144)" stopOpacity="0.1" />
                        </linearGradient>
                         <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                            <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                            </feMerge>
                        </filter>
                    </defs>
                    
                    <g> {/* Main group for elements */}
                        {/* Y-axis labels and grid lines */}
                        {[0, 25, 50, 75, 100].map(val => (
                            <g key={val}>
                                <text x={padding.left - 8} y={yScale(val)} dy="0.3em" textAnchor="end" fill="#94a3b8" fontSize="10">
                                    {val}%
                                </text>
                                <line
                                    x1={padding.left}
                                    x2={padding.left + chartWidth}
                                    y1={yScale(val)}
                                    y2={yScale(val)}
                                    stroke="#475569"
                                    strokeWidth="0.5"
                                    strokeDasharray="3 3"
                                />
                            </g>
                        ))}

                        {/* X-axis labels */}
                        {timeLabels.map((label, i) => (
                            <text key={i} x={label.x} y={svgHeight - 15} textAnchor="middle" fill="#94a3b8" fontSize="10">
                                {label.time}
                            </text>
                        ))}
                        <text x={svgWidth / 2} y={svgHeight - 2} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="bold">Time</text>


                        {/* Data Visualization */}
                        <path d={areaPath} fill="url(#areaGradient)" />
                        <polyline points={linePath} fill="none" stroke="#0ea5e9" strokeWidth="2" filter="url(#glow)"/>
                        
                        {/* Data points */}
                        {timeline.map((p, i) => {
                            const isHighRisk = p.similarity >= 75;
                            return (
                                <circle
                                    key={i}
                                    cx={xScale(p.timestamp)}
                                    cy={yScale(p.similarity)}
                                    r={isHighRisk ? 4 : 3}
                                    fill={isHighRisk ? '#f43f5e' : '#0ea5e9'}
                                    stroke={isHighRisk ? '#be123c' : '#0284c7'}
                                    strokeWidth="1.5"
                                >
                                </circle>
                            )
                        })}

                        {/* Interactive Elements */}
                        {activePoint && (
                            <g className="pointer-events-none">
                                {/* Scrubber Line */}
                                <line
                                    x1={xScale(activePoint.timestamp)}
                                    y1={padding.top}
                                    x2={xScale(activePoint.timestamp)}
                                    y2={padding.top + chartHeight}
                                    stroke="#fuchsia-400"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                                {/* Highlighted Circle */}
                                <circle
                                    cx={xScale(activePoint.timestamp)}
                                    cy={yScale(activePoint.similarity)}
                                    r="6"
                                    fill={activePoint.similarity >= 75 ? '#f43f5e' : '#0ea5e9'}
                                    stroke="#f8fafc"
                                    strokeWidth="2"
                                />
                            </g>
                        )}
                    </g>
                </svg>

                 {/* HTML Tooltip */}
                {activePoint && mousePos && (
                    <div
                        className="absolute pointer-events-none p-2 rounded-md bg-slate-900 border border-slate-700 text-xs shadow-xl transition-transform"
                        style={{
                            left: `${mousePos.x + 15}px`,
                            top: `${mousePos.y + 15}px`,
                            transform: `translate(${mousePos.x > svgWidth / 2 ? '-100%' : '0'}, ${mousePos.y > svgHeight / 2 ? '-100%' : '0'})`
                        }}
                    >
                        <p className="font-bold text-slate-200">{formatTime(activePoint.timestamp)}</p>
                        <p className="text-slate-400">Similarity: <span className="font-bold" style={{color: activePoint.similarity >= 75 ? '#f43f5e' : '#38bdf8'}}>{activePoint.similarity}%</span></p>
                    </div>
                )}
            </div>
             <div className="flex justify-end items-center gap-4 mt-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]"></span>
                    <span>Standard Similarity</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]"></span>
                    <span>High Similarity (&gt;=75%)</span>
                </div>
            </div>
        </div>
    );
};

export default SimilarityTimelineChart;
