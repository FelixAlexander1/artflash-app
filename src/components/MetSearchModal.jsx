import { useState } from 'react';
import { Search, X, Plus, Loader2 } from 'lucide-react';

export function MetSearchModal({ isOpen, onClose, onImportArtwork }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearchMetMuseum = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setResults([]);

    try {
      // 1. Buscamos solo objetos que TENGAN imagen pública (hasImages=true)
      const searchRes = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${encodeURIComponent(searchTerm)}`
      );
      const searchData = await searchRes.json();

      if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
        alert('No se encontraron obras con imagen para este término.');
        setLoading(false);
        return;
      }

      // 2. Tomamos los primeros 6 IDs
      const topIds = searchData.objectIDs.slice(0, 6);

      // 3. Consultamos los detalles completos en paralelo
      const detailPromises = topIds.map(async (id) => {
        const detailRes = await fetch(
          `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
        );
        return detailRes.json();
      });

      const detailedArtworks = await Promise.all(detailPromises);

      // 4. Mapeamos la estructura devuelta al formato de ArtFlash
      const formattedResults = detailedArtworks.map((item) => ({
        title: item.title || 'Sin título',
        artist: item.artistDisplayName || 'Artista desconocido',
        year: item.objectDate || 'Año desconocido',
        style: item.classification || 'Arte General',
        location: 'The Metropolitan Museum of Art',
        imageUrl: item.primaryImageSmall || item.primaryImage || '',
        notes: item.medium || ''
      }));

      // 5. Filtramos imágenes vacías
      setResults(formattedResults.filter((art) => art.imageUrl !== ''));

    } catch (error) {
      console.error('Error al consultar The Met API:', error);
      alert('Error al conectar con la API del museo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white bg-neutral-950 rounded-full border border-neutral-800"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-bold text-white mb-1">Importar desde The Met Museum API</h3>
        <p className="text-neutral-400 text-xs mb-4">
          Escribe un término en inglés (ej. <i>Sunflower</i>, <i>Van Gogh</i>, <i>Picasso</i>) para explorar.
        </p>

        {/* Formulario de búsqueda */}
        <form onSubmit={handleSearchMetMuseum} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar obra o artista en inglés..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs rounded-2xl flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'BUSCAR'}
          </button>
        </form>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
          {results.map((art, index) => (
            <div
              key={index}
              className="flex items-center gap-4 bg-neutral-950 p-3 rounded-2xl border border-neutral-800 hover:border-amber-500/50 transition"
            >
              <img
                src={art.imageUrl}
                alt={art.title}
                className="w-16 h-16 object-cover rounded-xl border border-neutral-800"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-xs truncate">{art.title}</h4>
                <p className="text-amber-400 text-[11px]">{art.artist}</p>
                <p className="text-neutral-500 text-[10px]">{art.year} • {art.style}</p>
              </div>
              <button
                onClick={() => {
                  onImportArtwork(art);
                  onClose();
                }}
                className="p-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl font-bold flex items-center gap-1 text-xs shrink-0"
              >
                <Plus size={16} />
                <span>Añadir</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}