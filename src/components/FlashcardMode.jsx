import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, MapPin, Calendar, BookOpen, Sparkles, Landmark, Glasses, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export function FlashcardMode({ artworks }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Estado para llevar un registro opcional de cómo va el alumno con cada tarjeta
  const [cardStats, setCardStats] = useState({});

  const currentArtwork = artworks?.[currentIndex];

  const handleNext = (rating) => {
    // Aquí puedes registrar el feedback de repetición espaciada si lo deseas
    if (rating && currentArtwork) {
      setCardStats(prev => ({
        ...prev,
        [currentArtwork.id || currentIndex]: rating
      }));
    }

    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % artworks.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + artworks.length) % artworks.length);
  };

  if (!currentArtwork) return null;

  const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23171717"/><text x="50%" y="50%" fill="%23f59e0b" font-family="sans-serif" font-size="20" text-anchor="middle">Obra de Arte</text></svg>';

  const imageSrc = currentArtwork.imageUrl || currentArtwork.image || FALLBACK_IMAGE;
  const cardNotes = currentArtwork.notes || currentArtwork.description || 'Sin información adicional.';

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Indicador de progreso */}
      <div className="flex justify-between items-center text-xs font-semibold text-neutral-400 mb-6">
        <span className="bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full shadow-inner">
          Tarjeta <strong className="text-white">{currentIndex + 1}</strong> de {artworks.length}
        </span>
        <span className="flex items-center space-x-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-full font-bold">
          <Sparkles size={12} />
          <span>{currentArtwork.style || 'Arte'}</span>
        </span>
      </div>

      {/* Contenedor de la Tarjeta */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition duration-500"></div>

        <div
          onClick={() => !isFlipped && setIsFlipped(true)}
          className={`relative h-[540px] w-full rounded-3xl transition-all duration-300 shadow-2xl overflow-hidden border border-neutral-800 bg-neutral-900 flex flex-col ${!isFlipped ? 'cursor-pointer' : ''}`}
        >
          {!isFlipped ? (
            /* --- CARA FRONTAL --- */
            <div className="relative h-full w-full bg-neutral-950">
              <img
                src={imageSrc}
                alt={currentArtwork.title || 'Obra de arte'}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  if (e.target.src !== FALLBACK_IMAGE) {
                    e.target.src = FALLBACK_IMAGE;
                  }
                }}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent p-6 flex flex-col justify-between">
                <span className="self-end bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-neutral-300 border border-white/10 font-medium">
                  Toca para girar 🔄
                </span>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                    {currentArtwork.title}
                  </h2>
                  <p className="text-amber-400 font-semibold text-sm mt-1">{currentArtwork.artist}</p>
                </div>
              </div>
            </div>
          ) : (
            /* --- CARA TRASERA (Ficha técnica completa) --- */
            <div className="h-full w-full p-4 sm:p-5 bg-neutral-900/95 backdrop-blur-xl text-neutral-100 flex flex-col justify-between border border-amber-500/30 overflow-y-auto custom-scrollbar">
              <div className="space-y-3">
                <div className="flex justify-between items-start border-b border-neutral-800 pb-2.5">
                  <div>
                    <span className="text-[10px] text-amber-400 font-extrabold tracking-widest uppercase">
                      Ficha Técnica de Examen
                    </span>
                    <h3 className="text-lg font-bold text-white mt-0.5">{currentArtwork.title}</h3>
                    <p className="text-neutral-400 text-xs font-medium">{currentArtwork.artist}</p>
                  </div>
                  <button 
                    onClick={() => setIsFlipped(false)}
                    className="p-1.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shrink-0 hover:bg-amber-500/20 transition-colors"
                  >
                    <RotateCw size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-neutral-950/60 p-2 rounded-xl border border-neutral-800 flex items-center space-x-2">
                    <Calendar size={14} className="text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[9px] text-neutral-500 block">Año</span>
                      <span className="text-xs font-semibold text-neutral-200">{currentArtwork.year || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="bg-neutral-950/60 p-2 rounded-xl border border-neutral-800 flex items-center space-x-2">
                    <MapPin size={14} className="text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[9px] text-neutral-500 block">Ubicación</span>
                      <span className="text-xs font-semibold text-neutral-200 truncate block max-w-[110px]">
                        {currentArtwork.location || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bloque de campos académicos compactos */}
                <div className="space-y-2 text-[11px] text-neutral-300">
                  {currentArtwork.chronology && (
                    <div className="bg-neutral-950/80 p-2 rounded-lg border border-neutral-800/80">
                      <span className="text-amber-400 font-bold block text-[10px] mb-0.5">Cronología / Siglo:</span>
                      <p className="text-neutral-300 leading-snug">{currentArtwork.chronology}</p>
                    </div>
                  )}

                  {currentArtwork.period && (
                    <div className="bg-neutral-950/80 p-2 rounded-lg border border-neutral-800/80">
                      <span className="text-amber-400 font-bold block text-[10px] mb-0.5">Período / Escuela:</span>
                      <p className="text-neutral-300 leading-snug">{currentArtwork.period}</p>
                    </div>
                  )}

                  {currentArtwork.context && (
                    <div className="bg-neutral-950/80 p-2 rounded-lg border border-neutral-800/80">
                      <span className="text-amber-400 font-bold block text-[10px] mb-0.5"><Landmark size={11} className="inline mr-1" />Contexto Histórico:</span>
                      <p className="text-neutral-400 leading-relaxed">{currentArtwork.context}</p>
                    </div>
                  )}

                  {currentArtwork.analysis && (
                    <div className="bg-neutral-950/80 p-2 rounded-lg border border-neutral-800/80">
                      <span className="text-amber-400 font-bold block text-[10px] mb-0.5"><Glasses size={11} className="inline mr-1" />Análisis Formal:</span>
                      <p className="text-neutral-400 leading-relaxed">{currentArtwork.analysis}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de Autoevaluación (Repetición Espaciada) */}
              <div className="pt-2.5 mt-2.5 border-t border-neutral-800">
                <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-bold block text-center mb-1.5">
                  ¿Cómo llevabas esta obra?
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleNext('hard')}
                    className="py-1.5 px-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1"
                  >
                    <XCircle size={13} />
                    <span>Fallé</span>
                  </button>
                  <button
                    onClick={() => handleNext('medium')}
                    className="py-1.5 px-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1"
                  >
                    <AlertCircle size={13} />
                    <span>Costó</span>
                  </button>
                  <button
                    onClick={() => handleNext('easy')}
                    className="py-1.5 px-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1"
                  >
                    <CheckCircle2 size={13} />
                    <span>Fácil</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botones de Navegación Básica inferiores */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={handlePrev}
          className="p-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-2xl text-white transition-all active:scale-95 shadow-lg"
        >
          <ChevronLeft size={20} />
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-extrabold rounded-2xl transition-all active:scale-95 flex items-center space-x-2 text-xs tracking-wide shadow-lg shadow-amber-500/20"
        >
          <RotateCw size={16} />
          <span>{isFlipped ? 'VER IMAGEN' : 'GIRAR TARJETA'}</span>
        </button>

        <button
          onClick={() => handleNext(null)}
          className="p-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-2xl text-white transition-all active:scale-95 shadow-lg"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}