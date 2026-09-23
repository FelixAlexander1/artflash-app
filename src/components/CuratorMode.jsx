import { useState, useRef } from 'react';
import { PlusCircle, Image as ImageIcon, Globe, Download, Upload, Sparkles } from 'lucide-react';
import { MetSearchModal } from './MetSearchModal';

export function CuratorMode({ artworks, onAddArtwork }) {
  const [isMetModalOpen, setIsMetModalOpen] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false); // 🔑 Estado añadido para la carga de la IA
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    year: '',
    style: '',
    location: '',
    imageUrl: '',
    notes: '',
    chronology: '',
    context: '',
    analysis: '',
    period: '',
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
      chronology: '',
      context: '',
      analysis: '',
      period: '',
    });

    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  // Exportar obras a JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(artworks, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "artflash_obras.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Importar obras desde JSON
  const handleImportJSON = (e) => {
    const fileReader = new FileReader();
    if (e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (Array.isArray(imported)) {
            imported.forEach((art) => onAddArtwork(art));
            alert(`¡Se han importado ${imported.length} obras con éxito!`);
          } else {
            alert("El archivo no tiene un formato de lista válido.");
          }
        } catch (error) {
          alert("Error al leer el archivo JSON.");
        }
      };
    }
  };

const handleGenerateWithAI = async () => {
    if (!formData.title || !formData.artist) {
      alert('Por favor, introduce al menos el Título y el Artista para que la IA pueda analizarlos.');
      return;
    }

    setIsLoadingAI(true);
    try {
      // 🔑 Añadimos el puerto completo del backend http://localhost:3001
      const response = await fetch('http://localhost:3001/api/ai/analyze-artwork', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title, artist: formData.artist }),
      });

      if (!response.ok) throw new Error('Error en el servidor de IA');

      const data = await response.json();
      
      // Rellenamos el formulario automáticamente con lo que devolvió Gemini
      setFormData((prev) => ({
        ...prev,
        year: data.year || prev.year,
        style: data.style || prev.style,
        location: data.location || prev.location,
        chronology: data.chronology || prev.chronology,
        period: data.period || prev.period,
        context: data.context || prev.context,
        analysis: data.analysis || prev.analysis,
      }));
    } catch (error) {
      console.error(error);
      alert('Hubo un error al generar el análisis automático.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      
      {/* --- BARRA SUPERIOR: IMPORTAR / EXPORTAR / MET API --- */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs text-neutral-300 font-medium transition"
          >
            <Download size={14} />
            <span>Exportar JSON</span>
          </button>

          <button
            onClick={() => fileInputRef.current.click()}
            className="flex items-center space-x-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs text-neutral-300 font-medium transition"
          >
            <Upload size={14} />
            <span>Importar JSON</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportJSON}
            accept=".json"
            className="hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMetModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold transition shadow-sm"
          >
            <Globe size={14} />
            <span>Buscar en el MET</span>
          </button>
          
          <button
            onClick={handleGenerateWithAI}
            disabled={isLoadingAI}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
          >
            <Sparkles size={14} />
            <span>{isLoadingAI ? 'Analizando...' : 'Generar con IA'}</span>
          </button>
        </div>
      </div>

      {/* --- FORMULARIO DE CREACIÓN DE FICHAS TÉCNICAS --- */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <PlusCircle size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Curador de Obras</h2>
            <p className="text-neutral-400 text-xs">
              Añade fichas técnicas avanzadas para exámenes de Historia del Arte.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm rounded-xl text-center font-medium">
            ¡Obra guardada correctamente!
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
                placeholder="Ej. Las Meninas"
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
                placeholder="Ej. Diego Velázquez"
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Año / Fecha</label>
              <input
                type="text"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                placeholder="Ej. 1656"
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Estilo / Movimiento</label>
              <input
                type="text"
                value={formData.style}
                onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                placeholder="Ej. Barroco"
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Ubicación Actual</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ej. Museo del Prado"
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* CAMPOS ACADÉMICOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-neutral-800 pt-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Cronología / Siglo</label>
              <input
                type="text"
                value={formData.chronology}
                onChange={(e) => setFormData({ ...formData, chronology: e.target.value })}
                placeholder="Ej. Siglo XVII (Pleno Barroco)"
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-400 mb-1">Período / Escuela</label>
              <input
                type="text"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                placeholder="Ej. Escuela Española"
                className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">Contexto Histórico y Cultural</label>
            <textarea
              rows={2}
              value={formData.context}
              onChange={(e) => setFormData({ ...formData, context: e.target.value })}
              placeholder="Contexto en el que se encuadra la obra..."
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">Análisis Formal e Iconográfico</label>
            <textarea
              rows={3}
              value={formData.analysis}
              onChange={(e) => setFormData({ ...formData, analysis: e.target.value })}
              placeholder="Composición, luz tenebrista, perspectiva aérea, simbolismo..."
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
            />
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
                placeholder="https://..."
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 mb-1">Notas Rápidas o Apuntes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notas clave de repaso..."
              className="w-full px-4 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold rounded-xl transition shadow-lg mt-2"
          >
            Guardar Ficha Técnica Completa
          </button>
        </form>
      </div>

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