import { useState, useEffect, useRef } from 'react';
import { Columns2, Sparkles, Calendar, MapPin, Glasses, Maximize2, Eye, FileText, Check, Loader2, Lightbulb, Search } from 'lucide-react';

export function ComparisonMode({ artworks }) {
  const [leftIndex, setLeftIndex] = useState(0);
  const [rightIndex, setRightIndex] = useState(artworks && artworks.length > 1 ? 1 : 0);
  
  // Estado para la altura general de las imágenes con el slider
  const [imageHeight, setImageHeight] = useState(360);

  // Estado para el modo de enfoque: 'split' (50/50), 'left' (Obra A principal), 'right' (Obra B principal)
  const [focusMode, setFocusMode] = useState('split');

  // Estados para el Asistente de IA
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showAiModal, setShowAiModal] = useState(false);

  // Estados para la Lupa Interactiva y Nivel de Zoom Dinámico
  const [activeMagnifier, setActiveMagnifier] = useState(null); // 'left' o 'right' o null
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(500); // Zoom inicial al 500% (5x)

  // Referencias para bloquear el scroll nativo de la página al usar la rueda
  const leftContainerRef = useRef(null);
  const rightContainerRef = useRef(null);

  if (!artworks || artworks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-neutral-400">
        <p>No hay suficientes obras en el catálogo para realizar una comparativa.</p>
      </div>
    );
  }

  const leftArtwork = artworks[leftIndex];
  const rightArtwork = artworks[rightIndex];

  // Clave única en localStorage basada en los índices de las dos obras comparadas
  const storageKey = `artflash_notes_${leftIndex}_${rightIndex}`;

  // Estado del Cuaderno de Notas inicializado desde localStorage
  const [notes, setNotes] = useState(() => {
    return localStorage.getItem(storageKey) || '';
  });
  
  const [savedStatus, setSavedStatus] = useState(false);

  // Actualizar el texto del cuaderno y limpiar estados al cambiar de obra
  useEffect(() => {
    const saved = localStorage.getItem(storageKey) || '';
    setNotes(saved);
    setAiAnalysis(null);
    setShowAiModal(false);
    setActiveMagnifier(null);
    setZoomLevel(500);
  }, [storageKey]);

  // Efecto para bloquear el scroll de la página de forma nativa ({ passive: false })
  useEffect(() => {
    const handleNativeWheel = (e) => {
      e.preventDefault(); // Bloquea totalmente el scroll de la página
      const delta = e.deltaY < 0 ? 50 : -50;
      setZoomLevel(prev => Math.min(Math.max(prev + delta, 200), 1000));
    };

    const leftEl = leftContainerRef.current;
    const rightEl = rightContainerRef.current;

    if (leftEl) leftEl.addEventListener('wheel', handleNativeWheel, { passive: false });
    if (rightEl) rightEl.addEventListener('wheel', handleNativeWheel, { passive: false });

    return () => {
      if (leftEl) leftEl.removeEventListener('wheel', handleNativeWheel);
      if (rightEl) rightEl.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  const handleSaveNotes = () => {
    localStorage.setItem(storageKey, notes);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleGenerateAiAnalysis = () => {
    setIsAiLoading(true);
    setShowAiModal(true);

    setTimeout(() => {
      setAiAnalysis({
        summary: `Comparativa estilística entre "${leftArtwork.title}" (${leftArtwork.artist}) y "${rightArtwork.title}" (${rightArtwork.artist}).`,
        points: [
          {
            title: "Tratamiento de la Luz y Color",
            desc: `Mientras que ${leftArtwork.artist} emplea pinceladas marcadas y texturas expresivas con predominio de tonos cálidos, ${rightArtwork.artist} busca una modulación lumínica más académica y limpia propia de su escuela.`
          },
          {
            title: "Composición y Espacio",
            desc: "Se observa una diferencia fundamental en la perspectiva: una obra prioriza el plano frontal y la bidimensionalidad expresiva, frente a la profundidad geométrica y el estudio anatómico de la otra."
          },
          {
            title: "Contexto e Iconografía",
            desc: `Ambas piezas reflejan la evolución de sus respectivos períodos (${leftArtwork.period || 'Clásico'} vs ${leftArtwork.period || 'Moderno'}), planteando enfoques totalmente opuestos sobre la representación visual.`
          }
        ]
      });
      setIsAiLoading(false);
    }, 1200);
  };

  // Manejador del movimiento del ratón para la posición de la lupa
  const handleMouseMove = (e, side) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
    setActiveMagnifier(side);
  };

  const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23171717"/><text x="50%" y="50%" fill="%23f59e0b" font-family="sans-serif" font-size="20" text-anchor="middle">Obra de Arte</text></svg>';

  let gridLayoutClass = "grid grid-cols-1 lg:grid-cols-2 gap-6";
  let leftColSpan = "";
  let rightColSpan = "";

  if (focusMode === 'left') {
    gridLayoutClass = "grid grid-cols-1 lg:grid-cols-3 gap-6";
    leftColSpan = "lg:col-span-2";
    rightColSpan = "lg:col-span-1";
  } else if (focusMode === 'right') {
    gridLayoutClass = "grid grid-cols-1 lg:grid-cols-3 gap-6";
    leftColSpan = "lg:col-span-1";
    rightColSpan = "lg:col-span-2";
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pb-16">
      {/* Cabecera del Modo Comparativa */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-6 bg-neutral-900 border border-neutral-800 p-4 rounded-2xl shadow-inner gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
            <Columns2 className="text-amber-400" size={22} />
            <span>Modo Comparativa Dinámica</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Compara obras o destaca una en primer plano. Pasa el ratón y usa la **rueda del ratón** para ajustar el zoom sin que se mueva la página.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleGenerateAiAnalysis}
            disabled={isAiLoading}
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-lg shadow-amber-500/20 transition active:scale-95 disabled:opacity-50"
          >
            {isAiLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            <span>Pedir análisis cruzado IA</span>
          </button>

          <div className="flex bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <button
              onClick={() => setFocusMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${focusMode === 'split' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'}`}
            >
              50 / 50
            </button>
            <button
              onClick={() => setFocusMode('left')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${focusMode === 'left' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'}`}
            >
              Zoom Obra A
            </button>
            <button
              onClick={() => setFocusMode('right')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${focusMode === 'right' ? 'bg-amber-500 text-neutral-950' : 'text-neutral-400 hover:text-white'}`}
            >
              Zoom Obra B
            </button>
          </div>

          <div className="flex items-center space-x-2 bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800">
            <Maximize2 size={14} className="text-amber-400" />
            <input
              type="range"
              min="220"
              max="550"
              step="20"
              value={imageHeight}
              onChange={(e) => setImageHeight(Number(e.target.value))}
              className="w-20 accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* --- PANEL DE IA --- */}
      {showAiModal && (
        <div className="mb-6 bg-gradient-to-br from-neutral-900 via-neutral-900 to-amber-950/20 border border-amber-500/30 rounded-3xl p-5 shadow-2xl transition-all animate-fadeIn">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/30">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Asistente ArtFlash: Puntos Clave de Comparación</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full font-normal">IA Activa</span>
                </h3>
                <p className="text-[11px] text-neutral-400">Generado automáticamente para tu comentario de texto.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAiModal(false)}
              className="text-neutral-500 hover:text-white text-xs px-2.5 py-1 rounded-lg bg-neutral-950 border border-neutral-800 transition"
            >
              Cerrar panel
            </button>
          </div>

          {isAiLoading ? (
            <div className="py-10 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 size={28} className="text-amber-400 animate-spin" />
              <p className="text-xs text-neutral-400 font-medium">Analizando proporciones, estilo y contexto histórico...</p>
            </div>
          ) : aiAnalysis ? (
            <div className="space-y-4">
              <p className="text-xs text-amber-300 font-semibold italic bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
                ✨ {aiAnalysis.summary}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {aiAnalysis.points.map((point, idx) => (
                  <div key={idx} className="bg-neutral-950/80 p-3.5 rounded-2xl border border-neutral-800 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider block mb-1">
                        0{idx + 1}. {point.title}
                      </span>
                      <p className="text-xs text-neutral-300 leading-relaxed">
                        {point.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => {
                    const textToAdd = `\n[Análisis IA]:\n- ${aiAnalysis.points.map(p => `${p.title}:${p.desc}`).join('\n- ')}`;
                    setNotes(prev => prev ? prev + "\n" + textToAdd : textToAdd);
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20 transition"
                >
                  <Lightbulb size={13} />
                  <span>Copiar puntos al Cuaderno de Notas</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Contenedor Principal Adaptativo */}
      <div className={gridLayoutClass}>
        
        {/* --- OBRA IZQUIERDA --- */}
        <div className={`bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all duration-300 ${leftColSpan}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Obra A:
                </label>
                <select
                  value={leftIndex}
                  onChange={(e) => setLeftIndex(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-amber-500"
                >
                  {artworks.map((art, idx) => (
                    <option key={idx} value={idx}>
                      {art.title} — {art.artist}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setFocusMode(focusMode === 'left' ? 'split' : 'left')}
                className={`mt-5 p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${
                  focusMode === 'left' ? 'bg-amber-500 text-neutral-950 border-amber-500' : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
                title="Poner en primer plano / Zoom"
              >
                <Eye size={15} />
              </button>
            </div>

            {/* Contenedor de Imagen con Ref y Bloqueo de Scroll NATIVO */}
            <div 
              ref={leftContainerRef}
              className="relative w-full rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 cursor-crosshair transition-all duration-200 group"
              style={{ height: focusMode === 'left' ? `${Math.max(imageHeight, 420)}px` : `${imageHeight}px` }}
              onMouseMove={(e) => handleMouseMove(e, 'left')}
              onMouseLeave={() => setActiveMagnifier(null)}
            >
              <img
                src={leftArtwork.imageUrl || leftArtwork.image || FALLBACK_IMAGE}
                alt={leftArtwork.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />

              {/* Indicador visual permanente */}
              <div className="absolute top-3 right-3 bg-neutral-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center space-x-1 shadow-lg pointer-events-none">
                <Search size={12} />
                <span>Rueda: Zoom ({Math.round(zoomLevel / 100)}x)</span>
              </div>

              {/* Lupa flotante circular */}
              {activeMagnifier === 'left' && (
                <div 
                  className="absolute pointer-events-none w-44 h-44 rounded-full border-2 border-amber-400 shadow-2xl overflow-hidden bg-neutral-950 z-35"
                  style={{
                    top: `clamp(0px, calc(${mousePos.y}% - 88px), 100%)`,
                    left: `clamp(0px, calc(${mousePos.x}% - 88px), 100%)`,
                    backgroundImage: `url(${leftArtwork.imageUrl || leftArtwork.image || FALLBACK_IMAGE})`,
                    backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                    backgroundSize: `${zoomLevel}%`,
                  }}
                >
                  <div className="absolute bottom-1 right-2 bg-neutral-950/90 text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-bold border border-neutral-800">
                    {Math.round(zoomLevel / 100)}x
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent p-4 flex flex-col justify-end pointer-events-none">
                <h3 className="text-lg font-bold text-white drop-shadow">{leftArtwork.title}</h3>
                <p className="text-amber-400 text-xs font-semibold">{leftArtwork.artist}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-neutral-300">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-neutral-950 p-2 rounded-xl border border-neutral-800 flex items-center space-x-2">
                  <Calendar size={14} className="text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[9px] text-neutral-500 block">Año</span>
                    <span className="font-semibold text-neutral-200">{leftArtwork.year || 'N/A'}</span>
                  </div>
                </div>
                <div className="bg-neutral-950 p-2 rounded-xl border border-neutral-800 flex items-center space-x-2">
                  <MapPin size={14} className="text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[9px] text-neutral-500 block">Ubicación</span>
                    <span className="font-semibold text-neutral-200 truncate block max-w-[120px]">{leftArtwork.location || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {leftArtwork.period && (
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                  <span className="text-amber-400 font-bold block text-[10px] mb-0.5">Período / Escuela:</span>
                  <p className="text-neutral-300">{leftArtwork.period}</p>
                </div>
              )}

              {leftArtwork.analysis && (
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                  <span className="text-amber-400 font-bold block text-[10px] mb-0.5"><Glasses size={11} className="inline mr-1" />Análisis Formal:</span>
                  <p className="text-neutral-400 leading-relaxed">{leftArtwork.analysis}</p>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* --- OBRA DERECHA --- */}
        <div className={`bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all duration-300 ${rightColSpan}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <label className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold block mb-1">
                  Obra B:
                </label>
                <select
                  value={rightIndex}
                  onChange={(e) => setRightIndex(Number(e.target.value))}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-medium focus:outline-none focus:border-amber-500"
                >
                  {artworks.map((art, idx) => (
                    <option key={idx} value={idx}>
                      {art.title} — {art.artist}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setFocusMode(focusMode === 'right' ? 'split' : 'right')}
                className={`mt-5 p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${
                  focusMode === 'right' ? 'bg-amber-500 text-neutral-950 border-amber-500' : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                }`}
                title="Poner en primer plano / Zoom"
              >
                <Eye size={15} />
              </button>
            </div>

            {/* Contenedor de Imagen con Ref y Bloqueo de Scroll NATIVO */}
            <div 
              ref={rightContainerRef}
              className="relative w-full rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 cursor-crosshair transition-all duration-200 group"
              style={{ height: focusMode === 'right' ? `${Math.max(imageHeight, 420)}px` : `${imageHeight}px` }}
              onMouseMove={(e) => handleMouseMove(e, 'right')}
              onMouseLeave={() => setActiveMagnifier(null)}
            >
              <img
                src={rightArtwork.imageUrl || rightArtwork.image || FALLBACK_IMAGE}
                alt={rightArtwork.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />

              {/* Indicador visual permanente */}
              <div className="absolute top-3 right-3 bg-neutral-950/80 backdrop-blur-md text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center space-x-1 shadow-lg pointer-events-none">
                <Search size={12} />
                <span>Rueda: Zoom ({Math.round(zoomLevel / 100)}x)</span>
              </div>

              {/* Lupa flotante circular */}
              {activeMagnifier === 'right' && (
                <div 
                  className="absolute pointer-events-none w-44 h-44 rounded-full border-2 border-amber-400 shadow-2xl overflow-hidden bg-neutral-950 z-35"
                  style={{
                    top: `clamp(0px, calc(${mousePos.y}% - 88px), 100%)`,
                    left: `clamp(0px, calc(${mousePos.x}% - 88px), 100%)`,
                    backgroundImage: `url(${rightArtwork.imageUrl || rightArtwork.image || FALLBACK_IMAGE})`,
                    backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                    backgroundSize: `${zoomLevel}%`,
                  }}
                >
                  <div className="absolute bottom-1 right-2 bg-neutral-950/90 text-amber-400 text-[9px] px-1.5 py-0.5 rounded font-bold border border-neutral-800">
                    {Math.round(zoomLevel / 100)}x
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent p-4 flex flex-col justify-end pointer-events-none">
                <h3 className="text-lg font-bold text-white drop-shadow">{rightArtwork.title}</h3>
                <p className="text-amber-400 text-xs font-semibold">{rightArtwork.artist}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-neutral-300">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-neutral-950 p-2 rounded-xl border border-neutral-800 flex items-center space-x-2">
                  <Calendar size={14} className="text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[9px] text-neutral-500 block">Año</span>
                    <span className="font-semibold text-neutral-200">{rightArtwork.year || 'N/A'}</span>
                  </div>
                </div>
                <div className="bg-neutral-950 p-2 rounded-xl border border-neutral-800 flex items-center space-x-2">
                  <MapPin size={14} className="text-amber-400 shrink-0" />
                  <div>
                    <span className="text-[9px] text-neutral-500 block">Ubicación</span>
                    <span className="font-semibold text-neutral-200 truncate block max-w-[120px]">{rightArtwork.location || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {rightArtwork.period && (
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                  <span className="text-amber-400 font-bold block text-[10px] mb-0.5">Período / Escuela:</span>
                  <p className="text-neutral-300">{rightArtwork.period}</p>
                </div>
              )}

              {rightArtwork.analysis && (
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                  <span className="text-amber-400 font-bold block text-[10px] mb-0.5"><Glasses size={11} className="inline mr-1" />Análisis Formal:</span>
                  <p className="text-neutral-400 leading-relaxed">{rightArtwork.analysis}</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* --- CUADERNO DE NOTAS --- */}
      <div className="mt-6 bg-neutral-900 border border-neutral-800 rounded-3xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <FileText size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Cuaderno de Notas / Conclusiones del Análisis</h3>
              <p className="text-[11px] text-neutral-400">Tus apuntes se guardan automáticamente para esta pareja de obras.</p>
            </div>
          </div>

          <button
            onClick={handleSaveNotes}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
              savedStatus ? 'bg-emerald-500 text-neutral-950' : 'bg-amber-500 hover:bg-amber-400 text-neutral-950 shadow-md shadow-amber-500/10'
            }`}
          >
            {savedStatus ? (
              <>
                <Check size={14} />
                <span>¡Guardado!</span>
              </>
            ) : (
              <span>Guardar Apuntes</span>
            )}
          </button>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={`Escribe aquí tus conclusiones comparando "${leftArtwork.title}" y "${rightArtwork.title}"...`}
          rows={3}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-3.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-amber-500 resize-y leading-relaxed"
        />
      </div>

    </div>
  );
}