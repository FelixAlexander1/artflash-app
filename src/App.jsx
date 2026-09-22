import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FlashcardMode } from './components/FlashcardMode';
import { QuizMode } from './components/QuizMode';
import { GalleryMode } from './components/GalleryMode';
import { CuratorMode } from './components/CuratorMode';

// Usamos 127.0.0.1 para mantener coherencia con el login del Navbar
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001/api/artworks';

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

  // 2. Cargar obras desde la API con control estricto del estado de carga
  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Error al conectar con la API');
        return res.json();
      })
      .then((data) => {
        setArtworks(data);
      })
      .catch((err) => {
        console.error('Error cargando obras:', err);
      })
      .finally(() => {
        setLoading(false); // Garantiza que la pantalla "Cargando" desaparezca
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
      // 1. Obtener el token guardado durante el login
      const token = localStorage.getItem('token'); 

      // 2. Realizar la petición POST con el encabezado de autorización
      const response = await fetch(import.meta.env.VITE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 👈 Encabezado imprescindible
        },
        body: JSON.stringify(newArtwork)
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          alert('Sesión expirada o no autorizada. Por favor, vuelve a iniciar sesión.');
        }
        throw new Error('Error al guardar la obra');
      }

      const savedArtwork = await response.json();
      
      // 3. Actualizar el estado local con la nueva obra devuelta por el backend
      setArtworks((prev) => [...prev, savedArtwork]);

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
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-amber-400 font-bold">
        Cargando obras de arte desde el servidor...
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