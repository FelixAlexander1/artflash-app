import { useState } from 'react';
import { Search, Plus, Loader2, Sparkles, X } from 'lucide-react';

export function MetSearchModal({ isOpen, onClose, onImportArtwork }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3001/api/external/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Error en búsqueda externa:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Cabecera */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-amber-400" size={20} />
            <h2 className="text-lg font-bold text-white">Importar desde The Met Museum API</h2>
          </div>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-white rounded-xl bg-neutral-800">
            <X size={18} />
          </button>
        </div>

        {/* Buscador */}
        <div className="p-6 border-b border-neutral-800/50">
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
              <input
                type="text"
                placeholder="Busca por autor u obra (ej: Monet, Rembrandt, Sunflower)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold rounded-xl text-xs flex items-center space-x-2 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <span>BUSCAR</span>}
            </button>
          </form>
        </div>

        {/* Resultados */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {results.map((art) => (
            <div key={art.id} className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col justify-between group">
              <div>
                <div className="h-40 overflow-hidden relative">
                  <img src={art.imageUrl} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                </div>
                <div className="p-3">
                  <h4 className="font-bold text-white text-xs line-clamp-1">{art.title}</h4>
                  <p className="text-neutral-400 text-[11px] mt-0.5">{art.artist}</p>
                </div>
              </div>

              <div className="p-3 pt-0">
                <button
                  onClick={() => {
                    onImportArtwork(art);
                    onClose();
                  }}
                  className="w-full py-2 bg-neutral-800 hover:bg-amber-500 hover:text-neutral-950 text-amber-400 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1"
                >
                  <Plus size={14} />
                  <span>Añadir a mi BD</span>
                </button>
              </div>
            </div>
          ))}

          {!loading && results.length === 0 && (
            <div className="col-span-full text-center py-12 text-neutral-500 text-xs">
              Escribe un término para explorar la colección digital del Museo Metropolitano.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}