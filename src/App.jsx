import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { FlashcardMode } from './components/FlashcardMode';
import { QuizMode } from './components/QuizMode';
import { GalleryMode } from './components/GalleryMode';
import { CuratorMode } from './components/CuratorMode';
import { ComparisonMode } from './components/ComparisonMode';
import { SessionModal } from './components/SessionModal'; // 👈 Importamos el componente de sesión rápido

const API_URL = import.meta.env.VITE_API_URL || 'https://artflash-backend.onrender.com/api/artworks';

export default function App() {
  const [artworks, setArtworks] = useState([]);
  const [activeTab, setActiveTab] = useState('flashcards');
  const [role, setRole] = useState('student');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔑 Estado para la sesión Kahoot rápida (Alumno o Profesor)
  const [sessionUser, setSessionUser] = useState(() => {
    const saved = sessionStorage.getItem('artflash_session');
    return saved ? JSON.parse(saved) : null;
  });

  // 1. Cargar obras desde la API
  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error('Error al conectar con la API');
        return res.json();
      })
      .then((data) => {
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

  const handleLoginSession = (sessionData) => {
    setSessionUser(sessionData);
    sessionStorage.setItem('artflash_session', JSON.stringify(sessionData));
    if (sessionData.role === 'teacher') {
      setRole('teacher');
      setActiveTab('gallery'); // Lleva al profesor directamente a gestionar
    } else {
      setRole('student');
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole === 'student' && (activeTab === 'curator' || activeTab === 'gallery')) {
      setActiveTab('flashcards');
    }
  };

  const handleAddArtwork = async (newArtwork) => {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newArtwork)
      });

      if (!response.ok) throw new Error('Error al guardar la obra');

      const savedArtwork = await response.json();
      const normalizedArtwork = {
        ...savedArtwork,
        imageUrl: savedArtwork.imageUrl || savedArtwork.imageurl
      };

      setArtworks((prev) => [normalizedArtwork, ...prev]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

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
      }
    } catch (err) {
      console.error('Error al actualizar la obra:', err);
    }
  };

  const handleDeleteArtwork = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (res.ok) {
        setArtworks((prev) => prev.filter((item) => item.id !== id));
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

  // 🔑 Si no ha iniciado sesión con el modal rápido de clase, se muestra primero
  if (!sessionUser) {
    return <SessionModal onLogin={handleLoginSession} />;
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
            sessionUser={sessionUser} // 👈 Pasamos el usuario activo al Quiz
          />
        )}
        
        {activeTab === 'comparison' && <ComparisonMode artworks={artworks} />}

        {activeTab === 'gallery' && role === 'teacher' && (
          <GalleryMode
            artworks={artworks}
            role={role}
            onDeleteArtwork={handleDeleteArtwork}
            onUpdateArtwork={handleUpdateArtwork}
          />
        )}

        {activeTab === 'curator' && role === 'teacher' && (
          <CuratorMode artworks={artworks} onAddArtwork={handleAddArtwork} />
        )}
      </main>
    </div>
  );
}