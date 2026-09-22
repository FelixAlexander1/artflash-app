import { useState } from 'react';
import { Search, Trash2, Edit2, MapPin, Calendar, X, Check } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80';

export function GalleryMode({ artworks, onDeleteArtwork, onUpdateArtwork }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Todos');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Extraer estilos únicos de la BD
  const styles = ['Todos', ...new Set(artworks.map((art) => art.style).filter(Boolean))];

  // Filtrado dinámico
  const filteredArtworks = artworks.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      art.artist.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStyle = selectedStyle === 'Todos' || art.style === selectedStyle;
    return matchesSearch && matchesStyle;
  });

  // 🔑 CORRECCIÓN 1: Aseguramos que imageUrl se inicialice leyendo ambas variantes
  const handleStartEdit = (art) => {
    setEditingId(art.id);
    setEditForm({
      ...art,
      imageUrl: art.imageUrl || art.imageurl || ''
    });
  };

  const handleSaveEdit = () => {
    onUpdateArtwork(editForm);
    setEditingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Barra de Filtros y Búsqueda */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-neutral-900/60 p-4 rounded-3xl border border-neutral-800 backdrop-blur-md">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
          <input
            type="text"
            placeholder="Buscar por obra o artista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-2xl text-white text-xs placeholder-neutral-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Chips de Estilo */}
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {styles.map((style) => (
            <button
              key={style}
              onClick={() => setSelectedStyle(style)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                selectedStyle === style
                  ? 'bg-amber-500 text-neutral-950 shadow-md shadow-amber-500/20'
                  : 'bg-neutral-950 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Cuadrícula de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArtworks.map((art) => {
          const isEditing = editingId === art.id;

          if (isEditing) {
            return (
              <div key={art.id} className="bg-neutral-900 border border-amber-500/50 rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-3">
                <div className="space-y-2 text-xs">
                  <span className="text-amber-400 font-bold uppercase tracking-wider block text-[10px]">Editando Obra</span>
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-white font-bold"
                    placeholder="Título"
                  />
                  <input
                    type="text"
                    value={editForm.artist || ''}
                    onChange={(e) => setEditForm({ ...editForm, artist: e.target.value })}
                    className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-300"
                    placeholder="Artista"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editForm.year || ''}
                      onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                      className="p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-300"
                      placeholder="Año"
                    />
                    <input
                      type="text"
                      value={editForm.style || ''}
                      onChange={(e) => setEditForm({ ...editForm, style: e.target.value })}
                      className="p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-300"
                      placeholder="Estilo"
                    />
                  </div>
                  <input
                    type="url"
                    value={editForm.imageUrl || ''}
                    onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                    className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-300"
                    placeholder="URL de la Imagen"
                  />
                  <textarea
                    rows={2}
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                    className="w-full p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-300"
                    placeholder="Notas"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl flex items-center justify-center space-x-1"
                  >
                    <Check size={14} />
                    <span>Guardar</span>
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            );
          }

          // 🔑 CORRECCIÓN 2: Evaluamos ambos posibles campos para renderizar la imagen
          const currentImageUrl = art.imageUrl || art.imageurl;

          return (
            <div key={art.id} className="bg-neutral-900 border border-neutral-800/80 rounded-3xl overflow-hidden shadow-xl flex flex-col group hover:border-neutral-700 transition">
              {/* Imagen con badge y fallback de error */}
              <div className="h-52 overflow-hidden relative bg-neutral-950">
                <img
                  src={currentImageUrl || FALLBACK_IMAGE}
                  alt={art.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = FALLBACK_IMAGE;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-full">
                  {art.style || 'Arte'}
                </div>
              </div>

              {/* Info */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-extrabold text-white leading-snug">{art.title}</h3>
                  <p className="text-amber-400 font-semibold text-xs mt-0.5">{art.artist}</p>

                  <div className="grid grid-cols-2 gap-2 my-3 text-[11px] text-neutral-400">
                    <span className="flex items-center gap-1.5 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                      <Calendar size={12} className="text-amber-400 shrink-0" />
                      <span className="truncate">{art.year || 'N/A'}</span>
                    </span>
                    <span className="flex items-center gap-1.5 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                      <MapPin size={12} className="text-amber-400 shrink-0" />
                      <span className="truncate">{art.location || 'N/A'}</span>
                    </span>
                  </div>

                  {art.notes && (
                    <p className="text-neutral-400 text-xs bg-neutral-950/50 p-3 rounded-2xl border border-neutral-800/50 line-clamp-2">
                      {art.notes}
                    </p>
                  )}
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-2 border-t border-neutral-800/60">
                  <button
                    onClick={() => handleStartEdit(art)}
                    className="flex-1 py-2 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Edit2 size={13} />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar "${art.title}" del catálogo?`)) {
                        onDeleteArtwork(art.id);
                      }
                    }}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl transition"
                    title="Eliminar obra"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredArtworks.length === 0 && (
        <div className="text-center py-16 text-neutral-500 text-xs">
          No se encontraron obras con los filtros aplicados.
        </div>
      )}
    </div>
  );
}