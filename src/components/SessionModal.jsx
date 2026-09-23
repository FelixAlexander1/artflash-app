import React, { useState } from 'react';

export function SessionModal({ onLogin }) {
  const [name, setName] = useState('');
  const [group, setGroup] = useState('');
  const [isTeacherMode, setIsTeacherMode] = useState(false);
  const [teacherPin, setTeacherPin] = useState('');
  const [error, setError] = useState('');

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !group.trim()) {
      setError('Por favor, introduce tu nombre y el código de la clase.');
      return;
    }
    // Guardamos la sesión como alumno
    onLogin({ role: 'student', name: name.trim(), group: group.trim().toUpperCase() });
  };

  const handleTeacherSubmit = (e) => {
    e.preventDefault();
    // PIN de profesor sencillo (puedes cambiarlo o gestionarlo en variable de entorno)
    if (teacherPin === 'profe2026') {
      onLogin({ role: 'teacher', name: 'Profesor' });
    } else {
      setError('PIN de profesor incorrecto.');
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>🎨 Academia de Arte</h2>
          <p style={styles.subtitle}>
            {isTeacherMode ? 'Acceso al Panel de Profesor' : 'Introduce tus datos para comenzar la sesión'}
          </p>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {!isTeacherMode ? (
          <form onSubmit={handleStudentSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nombre y Apellidos / Alias</label>
              <input
                type="text"
                placeholder="Ej. Lucía Gómez"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Código de Clase / Grupo</label>
              <input
                type="text"
                placeholder="Ej. 1BACH-A"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                style={styles.input}
              />
            </div>

            <button type="submit" style={styles.primaryBtn}>
              Entrar a la Clase 🚀
            </button>

            <button
              type="button"
              onClick={() => { setIsTeacherMode(true); setError(''); }}
              style={styles.switchBtn}
            >
              ¿Eres profesor? Accede aquí
            </button>
          </form>
        ) : (
          <form onSubmit={handleTeacherSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>PIN de Acceso Docente</label>
              <input
                type="password"
                placeholder="Introduce el PIN"
                value={teacherPin}
                onChange={(e) => setTeacherPin(e.target.value)}
                style={styles.input}
              />
            </div>

            <button type="submit" style={styles.primaryBtn}>
              Entrar como Profesor 📊
            </button>

            <button
              type="button"
              onClick={() => { setIsTeacherMode(false); setError(''); }}
              style={styles.switchBtn}
            >
              ← Volver al acceso de alumnos
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.9)',
    backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 2000, padding: '1rem',
  },
  card: {
    backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '20px',
    padding: '2.5rem', maxWidth: '420px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
  },
  header: { textAlign: 'center', marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', fontWeight: '800', color: '#fff', marginBottom: '0.5rem' },
  subtitle: { fontSize: '0.85rem', color: '#a1a1aa' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.8rem', fontWeight: '600', color: '#d4d4d8', textTransform: 'uppercase', letterSpacing: '0.05em' },
  input: {
    padding: '0.75rem 1rem', backgroundColor: '#09090b', border: '1px solid #3f3f46',
    borderRadius: '10px', color: '#fff', fontSize: '0.95rem', outline: 'none',
  },
  primaryBtn: {
    padding: '0.85rem', backgroundColor: '#f59e0b', border: 'none', borderRadius: '10px',
    color: '#000', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: 'transform 0.1s',
  },
  switchBtn: {
    background: 'none', border: 'none', color: '#a1a1aa', fontSize: '0.85rem',
    cursor: 'pointer', textAlign: 'center', textDecoration: 'underline', marginTop: '0.5rem',
  },
  error: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#f87171', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', textAlign: 'center',
  },
};