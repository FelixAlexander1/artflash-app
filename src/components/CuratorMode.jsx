import { useState } from 'react';
import { PlusCircle, Image as ImageIcon, Globe, Download, Upload } from 'lucide-react';
import { MetSearchModal } from './MetSearchModal';

export function CuratorMode({ artworks, onAddArtwork }) {
  const [isMetModalOpen, setIsMetModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    year: '',
    style: '',
    location: '',
    imageUrl: '',
    notes: '',
  });

  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.artist || !formData.imageUrl) return;

    onAddArtwork(formData);

    setFormData({
      title: '',
      artist: '',
      year: '',
      style: '',
      location: '',
      imageUrl: '',
      notes: '',
    });

    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  // Exportación JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(artworks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `artflash_coleccion_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Importación JSON
  const handleImportJSON = (e) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsedData = JSON.parse(event.target.result);
          if (Array.isArray(parsedData)) {
            parsedData.forEach((art) => onAddArtwork(art));
            setSuccessMsg(true);
            setTimeout(() => setSuccessMsg(false), 3000);
          }
        } catch (err) {
          alert('El archivo cargado no tiene un formato JSON válido.');
        }
      };
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Botones de Gestión JSON */}
      <div className="mb-6 flex justify-between items-center bg-neutral-900 border border-neutral-800 p-4 rounded-2xl text-xs">
        <span className="text-neutral-400 font-medium">Gestión de Copia de Seguridad:</span>
        <div className="flex gap-2">
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-amber-400 border border-neutral-800 rounded-xl font-bold flex items-center space-x-1.5 transition"
          >
            <Download size={14} />
            <span>Exportar JSON</span>
          </button>

          <label className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-xl font-bold flex items-center space-x-1.5 cursor-pointer transition">
            <Upload size={14} />
            <span>Importar JSON</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {/* Banner para la Búsqueda en API Externa */}
      <div className="mb-8 p-6 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-base flex items-center space-x-2">
            <Globe className="text-amber-400" size={18} />
            <span>¿Buscas una obra famosa?</span>
          </h3>
          <p className="text-neutral-400 text-xs mt-1">
            Importa automáticamente datos e imágenes desde la colección del Met Museum.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsMetModalOpen(true)}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold rounded-xl transition shrink-0"
        >
          BUSCAR EN API
        </button>
      </div>

      {/* Formulario de Entrada Manual */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <PlusCircle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Curador de Obras</h2>
            <p className="text-neutral-400 text-xs">
              Añade nuevas fichas técnicas para los exámenes de tus alumnos.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm rounded-xl text-center font-medium">
            ¡Operación realizada correctamente!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Título de la Obra *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ej. Guernica"
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Autor / Artista *</label>
              <input
                type="text"
                required
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                placeholder="Ej. Pablo Picasso"
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Año / Período</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="Ej. 1937"
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Estilo / Movimiento</label>
              <input
                type="text"
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                placeholder="Ej. Cubismo"
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Ubicación Actual</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ej. Museo Reina Sofía"
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">URL de la Imagen (HD) *</label>
            <div className="relative">
              <ImageIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="url"
                required
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">Notas Contextuales para el Examen</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Detalles clave para el examen (composición, uso de luz, contexto histórico...)"
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl transition shadow-lg mt-2"
          >
            Guardar Obra en el Catálogo
          </button>
        </form>
      </div>

      {/* Modal de Búsqueda Externa */}
      <MetSearchModal
        isOpen={isMetModalOpen}
        onClose={() => setIsMetModalOpen(false)}
        onImportArtwork={(importedArt) => {
          onAddArtwork(importedArt);
          setSuccessMsg(true);
          setTimeout(() => setSuccessMsg(false), 3000);
        }}
      />
    </div>
  );
}