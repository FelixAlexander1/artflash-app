import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FlashcardMode } from './components/FlashcardMode';
import { QuizMode } from './components/QuizMode';
import { GalleryMode } from './components/GalleryMode';
import { CuratorMode } from './components/CuratorMode';

// Usamos la variable de entorno de Vercel y mantenemos una URL relativa segura como respaldo
const API_URL = import.meta.env.VITE_API_URL || 'https://artflash-backend.onrender.com/api/artworks';

export default function App() {
  const [artworks, setArtworks] = useState([]);
  const [activeTab, setActiveTab] = useState('flashcards');
  const [role, setRole] = useState('student');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Restaurar la sesión almacenada en localStorage al cargar la app
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setRole(parsedUser.role || 'student');
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // 2. Cargar obras desde la API normalizando la propiedad imageUrl
  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Error al conectar con la API');
        return res.json();
      })
      .then((data) => {
        // 🔑 NORMALIZACIÓN: Aseguramos que la imagen se lea aunque PostgreSQL la devuelva como 'imageurl'
        const normalizedData = data.map((art) => ({
          ...art,
          imageUrl: art.imageUrl || art.imageurl
        }));
        setArtworks(normalizedData);
      })
      .catch((err) => {
        console.error('Error cargando obras:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Helper para adjuntar el token JWT en las peticiones que requieren permisos
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  // Redirigir al alumno fuera de vistas restringidas
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'student' && (activeTab === 'curator' || activeTab === 'gallery')) {
      setActiveTab('flashcards');
    }
  };

  // Agregar obra (POST)
  const handleAddArtwork = async (newArtwork) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(), // 👈 Reutilizamos el helper de autenticación
        body: JSON.stringify(newArtwork)
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert('Sesión expirada o no autorizada. Por favor, vuelve a iniciar sesión.');
        }
        throw new Error('Error al guardar la obra');
      }

      const savedArtwork = await response.json();
      
      // Normalizamos la obra guardada antes de añadirla al estado local
      const normalizedArtwork = {
        ...savedArtwork,
        imageUrl: savedArtwork.imageUrl || savedArtwork.imageurl
      };

      setArtworks((prev) => [normalizedArtwork, ...prev]);

    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Actualizar obra (PUT)
  const handleUpdateArtwork = async (updatedArtwork) => {
    try {
      const res = await fetch(`${API_URL}/${updatedArtwork.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedArtwork),
      });

      if (res.ok) {
        setArtworks((prev) =>
          prev.map((item) => (item.id === updatedArtwork.id ? updatedArtwork : item))
        );
      } else {
        alert('No tienes autorización para modificar esta obra');
      }
    } catch (err) {
      console.error('Error al actualizar la obra:', err);
    }
  };

  // Eliminar obra (DELETE)
  const handleDeleteArtwork = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        setArtworks((prev) => prev.filter((item) => item.id !== id));
      } else {
        alert('No tienes autorización para eliminar obras');
      }
    } catch (err) {
      console.error('Error al eliminar la obra:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-amber-400 font-bold space-y-4">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-neutral-400 text-center px-4">
          Despertando el servidor del museo (esto puede tomar unos segundos)...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-neutral-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        role={role}
        setRole={handleRoleChange}
        user={user}
        setUser={setUser}
      />

      <main className="container mx-auto">
        {activeTab === 'flashcards' && <FlashcardMode artworks={artworks} />}

        {activeTab === 'quiz' && (
          <QuizMode
            artworks={artworks}
            onClose={() => setActiveTab('flashcards')}
          />
        )}

        {/* El Catálogo solo es visible para profesores */}
        {activeTab === 'gallery' && role === 'teacher' && (
          <GalleryMode
            artworks={artworks}
            role={role}
            onDeleteArtwork={handleDeleteArtwork}
            onUpdateArtwork={handleUpdateArtwork}
          />
        )}

        {/* El Curador solo es visible para profesores */}
        {activeTab === 'curator' && role === 'teacher' && (
          <CuratorMode artworks={artworks} onAddArtwork={handleAddArtwork} />
        )}
      </main>
    </div>
  );
}