import { useState } from 'react';
import { MedicalViewer } from './components/MedicalViewer';
import { ImageMetadata } from './types';
import { Database, ChevronRight, Microscope } from 'lucide-react';
import { cn } from './lib/utils';

const CLINICAL_STUDIES: ImageMetadata[] = [
  {
    id: "CELL-001-H",
    patientName: "Sarah Jenkins",
    modality: "Histopathology - H&E Stain",
    date: "2024-03-02 10:30 AM",
    resolution: "4000 x 3000 px",
    url: "https://picsum.photos/seed/microscope-cells-1/4000/3000"
  },
  {
    id: "CELL-002-B",
    patientName: "Robert Chen",
    modality: "Hematology - Peripheral Smear",
    date: "2024-03-02 11:15 AM",
    resolution: "4000 x 3000 px",
    url: "https://picsum.photos/seed/blood-cells-2/4000/3000"
  },
  {
    id: "CELL-003-N",
    patientName: "Elena Rodriguez",
    modality: "Neuropathology - Silver Stain",
    date: "2024-03-01 02:45 PM",
    resolution: "4000 x 3000 px",
    url: "https://picsum.photos/seed/neuron-cells-3/4000/3000"
  },
  {
    id: "CELL-004-P",
    patientName: "Marcus Thorne",
    modality: "Cytopathology - Pap Smear",
    date: "2024-02-28 08:20 AM",
    resolution: "4000 x 3000 px",
    url: "https://picsum.photos/seed/pathology-cells-4/4000/3000"
  },
  {
    id: "CELL-005-M",
    patientName: "Linda Wu",
    modality: "Immunofluorescence - Confocal",
    date: "2024-02-27 04:10 PM",
    resolution: "4000 x 3000 px",
    url: "https://picsum.photos/seed/fluorescence-cells-5/4000/3000"
  }
];

export default function App() {
  const [selectedStudy, setSelectedStudy] = useState<ImageMetadata>(CLINICAL_STUDIES[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="w-screen h-screen overflow-hidden flex bg-black">
      {/* Sidebar for Study Selection */}
      <div 
        className={cn(
          "h-full border-r border-white/10 bg-[#050505] transition-all duration-300 flex flex-col z-30",
          isSidebarOpen ? "w-80" : "w-16"
        )}
      >
        <div className="h-14 border-b border-white/10 flex items-center px-4 justify-between shrink-0">
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-white/80">Study Library</span>
            </div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-white/5 rounded-md transition-colors"
          >
            <ChevronRight className={cn("w-4 h-4 text-white/40 transition-transform", isSidebarOpen && "rotate-180")} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {CLINICAL_STUDIES.map((study) => (
            <button
              key={study.id}
              onClick={() => setSelectedStudy(study)}
              className={cn(
                "w-full text-left p-3 rounded-xl transition-all border group",
                selectedStudy.id === study.id 
                  ? "bg-emerald-500/10 border-emerald-500/30" 
                  : "bg-transparent border-transparent hover:bg-white/5"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  selectedStudy.id === study.id ? "bg-emerald-500 text-black" : "bg-white/5 text-white/40 group-hover:text-white/60"
                )}>
                  <Microscope className="w-4 h-4" />
                </div>
                {isSidebarOpen && (
                  <div className="min-w-0">
                    <p className={cn(
                      "text-xs font-semibold truncate",
                      selectedStudy.id === study.id ? "text-emerald-400" : "text-white/80"
                    )}>
                      {study.patientName}
                    </p>
                    <p className="text-[10px] text-white/40 truncate mt-0.5">{study.modality}</p>
                    <p className="text-[9px] text-white/20 font-mono mt-1">{study.id}</p>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {isSidebarOpen && (
          <div className="p-4 border-t border-white/10 bg-black/20">
            <div className="flex items-center gap-2 text-[10px] text-white/30 uppercase font-bold mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Database Online
            </div>
            <p className="text-[9px] text-white/20 leading-relaxed">
              Connected to Lumina Cloud Archive. High-resolution DICOM assets ready for deep-zoom analysis.
            </p>
          </div>
        )}
      </div>

      {/* Main Viewer */}
      <div className="flex-1 h-full relative">
        <MedicalViewer key={selectedStudy.id} imageMetadata={selectedStudy} />
      </div>
    </div>
  );
}
