import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw, MapPin, Calendar, BookOpen, Sparkles, Landmark, Glasses } from 'lucide-react';

export function FlashcardMode({ artworks }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentArtwork = artworks?.[currentIndex];

  const handleNext = () => {
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
          onClick={() => setIsFlipped(!isFlipped)}
          className="cursor-pointer relative h-[540px] w-full rounded-3xl transition-all duration-300 shadow-2xl overflow-hidden border border-neutral-800 bg-neutral-900 flex flex-col"
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
            <div className="h-full w-full p-5 sm:p-6 bg-neutral-900/95 backdrop-blur-xl text-neutral-100 flex flex-col justify-between border border-amber-500/30 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-neutral-800 pb-3">
                  <div>
                    <span className="text-[10px] text-amber-400 font-extrabold tracking-widest uppercase">
                      Ficha Técnica de Examen
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">{currentArtwork.title}</h3>
                    <p className="text-neutral-400 text-xs font-medium">{currentArtwork.artist}</p>
                  </div>
                  <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20 shrink-0">
                    <RotateCw size={16} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-neutral-950/60 p-2.5 rounded-2xl border border-neutral-800 flex items-center space-x-2">
                    <Calendar size={15} className="text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Año</span>
                      <span className="text-xs font-semibold text-neutral-200">{currentArtwork.year || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="bg-neutral-950/60 p-2.5 rounded-2xl border border-neutral-800 flex items-center space-x-2">
                    <MapPin size={15} className="text-amber-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-neutral-500 block">Ubicación</span>
                      <span className="text-xs font-semibold text-neutral-200 truncate block max-w-[110px]">
                        {currentArtwork.location || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bloque de nuevos campos académicos */}
                <div className="space-y-2.5 text-xs text-neutral-300">
                  {currentArtwork.chronology && (
                    <div className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800">
                      <span className="text-amber-400 font-bold block text-[11px] mb-0.5">Cronología / Siglo:</span>
                      <p className="text-neutral-300">{currentArtwork.chronology}</p>
                    </div>
                  )}

                  {currentArtwork.period && (
                    <div className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800">
                      <span className="text-amber-400 font-bold block text-[11px] mb-0.5">Período / Escuela:</span>
                      <p className="text-neutral-300">{currentArtwork.period}</p>
                    </div>
                  )}

                  {currentArtwork.context && (
                    <div className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800">
                      <span className="text-amber-400 font-bold block text-[11px] mb-0.5"><Landmark size={12} className="inline mr-1" />Contexto Histórico:</span>
                      <p className="text-neutral-400 leading-relaxed">{currentArtwork.context}</p>
                    </div>
                  )}

                  {currentArtwork.analysis && (
                    <div className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800">
                      <span className="text-amber-400 font-bold block text-[11px] mb-0.5"><Glasses size={12} className="inline mr-1" />Análisis Formal:</span>
                      <p className="text-neutral-400 leading-relaxed">{currentArtwork.analysis}</p>
                    </div>
                  )}

                  <div className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-800">
                    <div className="flex items-center space-x-1 text-[11px] font-bold text-amber-400 mb-0.5">
                      <BookOpen size={12} />
                      <span>Claves Rápidas</span>
                    </div>
                    <p className="text-neutral-300">{cardNotes}</p>
                  </div>
                </div>
              </div>

              <div className="text-center text-[11px] text-neutral-500 font-medium pt-3 mt-2 border-t border-neutral-800">
                Haz clic de nuevo para ver la imagen
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botones de Navegación */}
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
          <span>GIRAR TARJETA</span>
        </button>

        <button
          onClick={handleNext}
          className="p-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-2xl text-white transition-all active:scale-95 shadow-lg"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}