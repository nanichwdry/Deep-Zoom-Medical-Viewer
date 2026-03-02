import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useDeepZoom } from '../hooks/useDeepZoom';
import { ImageMetadata, Annotation, Point } from '../types';
import { 
  Maximize, Minimize, RotateCcw, Info, Activity, Layers, Search, 
  Pencil, Save, Trash2, Download, Check
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ViewerProps {
  imageMetadata: ImageMetadata;
}

export const MedicalViewer: React.FC<ViewerProps> = ({ imageMetadata }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showInfo, setShowInfo] = useState(true);
  
  // Annotation state
  const [mode, setMode] = useState<'view' | 'draw'>('view');
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentPath, setCurrentPath] = useState<Point[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const { viewState, resetView } = useDeepZoom(canvasRef, { disabled: mode === 'draw' });

  // Load Image
  useEffect(() => {
    setLoading(true);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageMetadata.url;
    img.onload = () => {
      setImage(img);
      setLoading(false);
      if (containerRef.current) {
        resetView(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight,
          img.width,
          img.height
        );
      }
    };
  }, [imageMetadata.url, resetView]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current && image) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [image]);

  // Drawing Logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'draw' || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewState.offset.x) / viewState.scale;
    const y = (e.clientY - rect.top - viewState.offset.y) / viewState.scale;
    
    setCurrentPath([{ x, y }]);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mode !== 'draw' || !currentPath || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewState.offset.x) / viewState.scale;
    const y = (e.clientY - rect.top - viewState.offset.y) / viewState.scale;
    
    setCurrentPath([...currentPath, { x, y }]);
  };

  const handleMouseUp = () => {
    if (mode !== 'draw' || !currentPath) return;
    
    if (currentPath.length > 1) {
      setAnnotations([...annotations, {
        id: Math.random().toString(36).substr(2, 9),
        points: currentPath,
        color: '#10b981' // emerald-500
      }]);
    }
    setCurrentPath(null);
  };

  // Draw Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply image processing filters
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
    
    ctx.save();
    ctx.translate(viewState.offset.x, viewState.offset.y);
    ctx.scale(viewState.scale, viewState.scale);
    
    // Draw Image
    ctx.drawImage(image, 0, 0);
    
    // Draw Annotations
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2 / viewState.scale; // Keep line width consistent regardless of zoom
    
    const drawPath = (points: Point[], color: string) => {
      if (points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    };

    annotations.forEach(ann => drawPath(ann.points, ann.color));
    if (currentPath) drawPath(currentPath, '#10b981');
    
    ctx.restore();
    ctx.filter = 'none';

  }, [image, viewState, brightness, contrast, annotations, currentPath]);

  const handleReset = () => {
    if (image && containerRef.current) {
      resetView(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight,
        image.width,
        image.height
      );
    }
  };

  const saveSnippet = async () => {
    if (!image || !canvasRef.current) return;
    setIsSaving(true);
    
    try {
      // Create a 512x512 snippet canvas
      const snippetCanvas = document.createElement('canvas');
      snippetCanvas.width = 512;
      snippetCanvas.height = 512;
      const sCtx = snippetCanvas.getContext('2d');
      if (!sCtx) return;

      // We want to capture the center of the current view
      const centerX = (canvasRef.current.width / 2 - viewState.offset.x) / viewState.scale;
      const centerY = (canvasRef.current.height / 2 - viewState.offset.y) / viewState.scale;

      // Draw the image and annotations onto the snippet canvas
      sCtx.fillStyle = '#000';
      sCtx.fillRect(0, 0, 512, 512);
      
      sCtx.save();
      sCtx.translate(256, 256); // Center of snippet
      sCtx.scale(viewState.scale, viewState.scale);
      sCtx.translate(-centerX, -centerY);
      
      // Apply filters (optional, but usually snippets should preserve the view)
      sCtx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      sCtx.drawImage(image, 0, 0);
      sCtx.filter = 'none';

      // Draw annotations
      sCtx.lineCap = 'round';
      sCtx.lineJoin = 'round';
      sCtx.lineWidth = 2 / viewState.scale;
      
      const drawPathOnSnippet = (points: Point[], color: string) => {
        if (points.length < 2) return;
        sCtx.beginPath();
        sCtx.strokeStyle = color;
        sCtx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          sCtx.lineTo(points[i].x, points[i].y);
        }
        sCtx.stroke();
      };

      annotations.forEach(ann => drawPathOnSnippet(ann.points, ann.color));
      sCtx.restore();

      // Download the snippet
      const dataUrl = snippetCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `medical-snippet-${imageMetadata.id}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to save snippet:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden flex flex-col font-sans text-white">
      {/* Header / Toolbar */}
      <div className="h-14 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Activity className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight">Lumina Medical</h1>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Deep-Zoom Engine v2.4</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
            <button 
              onClick={() => setMode('view')}
              className={cn(
                "px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-2",
                mode === 'view' ? "bg-white/10 text-white shadow-lg" : "text-white/40 hover:text-white/60"
              )}
            >
              <Search className="w-3 h-3" />
              View
            </button>
            <button 
              onClick={() => setMode('draw')}
              className={cn(
                "px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-2",
                mode === 'draw' ? "bg-emerald-500 text-black shadow-lg" : "text-white/40 hover:text-white/60"
              )}
            >
              <Pencil className="w-3 h-3" />
              Annotate
            </button>
          </div>

          <div className="w-px h-6 bg-white/10 mx-2" />
          
          <button 
            onClick={saveSnippet}
            disabled={isSaving}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border",
              saveSuccess 
                ? "bg-emerald-500 border-emerald-500 text-black" 
                : "bg-white/5 border-white/10 text-white hover:bg-white/10 disabled:opacity-50"
            )}
          >
            {isSaving ? (
              <div className="w-3 h-3 border border-white/20 border-t-white rounded-full animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3 h-3" />
            ) : (
              <Save className="w-3 h-3" />
            )}
            {saveSuccess ? "Saved" : "Save Snippet"}
          </button>

          <button 
            onClick={handleReset}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4 text-white/60 group-hover:text-white" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showInfo ? "bg-emerald-500/20 text-emerald-400" : "hover:bg-white/10 text-white/60"
            )}
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Viewer Area */}
      <div 
        ref={containerRef} 
        className={cn(
          "flex-1 relative",
          mode === 'view' ? "cursor-move" : "cursor-crosshair"
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              <p className="text-xs font-mono text-emerald-500 animate-pulse">LOADING HIGH-RES DATA...</p>
            </div>
          </div>
        )}
        <canvas 
          ref={canvasRef}
          className="block w-full h-full"
        />

        {/* Floating Controls */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-3 z-20">
          {annotations.length > 0 && (
            <button 
              onClick={() => setAnnotations([])}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-[10px] font-bold uppercase text-red-400 transition-all"
            >
              <Trash2 className="w-3 h-3" />
              Clear Annotations ({annotations.length})
            </button>
          )}

          <div className="p-4 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-64">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/80">Image Processing</span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-white/40 uppercase font-bold">
                  <span>Brightness</span>
                  <span className="text-white/80">{brightness}%</span>
                </div>
                <input 
                  type="range" min="0" max="200" value={brightness} 
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] text-white/40 uppercase font-bold">
                  <span>Contrast</span>
                  <span className="text-white/80">{contrast}%</span>
                </div>
                <input 
                  type="range" min="0" max="200" value={contrast} 
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Patient Info Overlay */}
        {showInfo && (
          <div className="absolute top-6 right-6 w-72 p-5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-20">
            <div className="flex items-center justify-between mb-4">
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-widest rounded border border-emerald-500/30">
                Active Study
              </span>
              <span className="text-[10px] font-mono text-white/40">ID: {imageMetadata.id}</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-white/30 uppercase font-bold block mb-1">Patient Name</label>
                <p className="text-sm font-medium text-white/90">{imageMetadata.patientName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-white/30 uppercase font-bold block mb-1">Modality</label>
                  <p className="text-xs font-medium text-white/80">{imageMetadata.modality}</p>
                </div>
                <div>
                  <label className="text-[10px] text-white/30 uppercase font-bold block mb-1">Date</label>
                  <p className="text-xs font-medium text-white/80">{imageMetadata.date}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-[10px] text-white/40">
                  <Search className="w-3 h-3" />
                  <span>Native Resolution: {imageMetadata.resolution}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Map (Mini-map) */}
        <div className="absolute bottom-6 right-6 w-32 h-32 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden z-20 hidden md:block">
          <div className="absolute inset-0 opacity-20">
            {image && (
              <img 
                src={imageMetadata.url} 
                className="w-full h-full object-cover" 
                alt="Mini map"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
          {/* Viewport Indicator */}
          {image && containerRef.current && (
            <div 
              className="absolute border border-emerald-500 bg-emerald-500/10 pointer-events-none"
              style={{
                left: `${(-viewState.offset.x / (image.width * viewState.scale)) * 100}%`,
                top: `${(-viewState.offset.y / (image.height * viewState.scale)) * 100}%`,
                width: `${(containerRef.current.clientWidth / (image.width * viewState.scale)) * 100}%`,
                height: `${(containerRef.current.clientHeight / (image.height * viewState.scale)) * 100}%`,
              }}
            />
          )}
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="h-8 bg-black border-t border-white/5 flex items-center justify-between px-4 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">System Ready</span>
          </div>
          <span className="text-[10px] text-white/20 font-mono">|</span>
          <span className="text-[10px] text-white/40 font-mono">X: {viewState.offset.x.toFixed(0)} Y: {viewState.offset.y.toFixed(0)}</span>
          <span className="text-[10px] text-white/20 font-mono">|</span>
          <span className="text-[10px] text-white/40 font-mono uppercase">Mode: {mode}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-white/40 font-mono uppercase">GPU Acceleration: Active</span>
        </div>
      </div>
    </div>
  );
};
