import React, { useState, useEffect } from 'react';

export function QuizMode({ artworks, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  // Guardamos el historial de IDs de obras ya utilizadas en los test
  const [usedArtworkIds, setUsedArtworkIds] = useState([]);

  const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23171717"/><text x="50%" y="50%" fill="%23f59e0b" font-family="sans-serif" font-size="20" text-anchor="middle">Obra de Arte</text></svg>';

  const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const generateQuiz = () => {
    if (!artworks || artworks.length < 3) return;

    let availableArtworks = artworks.filter((a) => !usedArtworkIds.includes(a.id));

    if (availableArtworks.length < 3) {
      availableArtworks = artworks;
      setUsedArtworkIds([]);
    }

    const shuffledAvailable = shuffleArray(availableArtworks);
    const selectedForQuiz = shuffledAvailable.slice(0, 5); // Tomamos máximo 5 obras

    const newUsedIds = selectedForQuiz.map((a) => a.id);
    setUsedArtworkIds((prev) => [...prev, ...newUsedIds]);

    const generatedQuestions = selectedForQuiz.map((artwork) => {
      // Tipos de preguntas estándar y académicas avanzadas
      const baseTypes = ['artist', 'year', 'style', 'location'];
      
      // Añadimos tipos académicos solo si la obra tiene información en dichos campos
      if (artwork.chronology) baseTypes.push('chronology');
      if (artwork.period) baseTypes.push('period');
      if (artwork.context) baseTypes.push('context');
      if (artwork.analysis) baseTypes.push('analysis');

      const randomType = baseTypes[Math.floor(Math.random() * baseTypes.length)];

      let questionText = '';
      let correctAnswer = '';
      let incorrectOptions = [];

      if (randomType === 'artist') {
        questionText = `¿Quién pintó la obra "${artwork.title}"?`;
        correctAnswer = artwork.artist;
        incorrectOptions = artworks.filter((a) => a.artist !== artwork.artist).map((a) => a.artist);
      } else if (randomType === 'year') {
        questionText = `¿En qué año se creó la obra "${artwork.title}" de ${artwork.artist}?`;
        correctAnswer = artwork.year ? artwork.year.toString() : 'Desconocido';
        incorrectOptions = artworks.filter((a) => a.year !== artwork.year).map((a) => (a.year ? a.year.toString() : 'Desconocido'));
      } else if (randomType === 'style') {
        questionText = `¿A qué estilo o movimiento artístico pertenece "${artwork.title}"?`;
        correctAnswer = artwork.style || 'Arte General';
        incorrectOptions = artworks.filter((a) => a.style !== artwork.style).map((a) => a.style || 'Arte General');
      } else if (randomType === 'location') {
        questionText = `¿Dónde se encuentra actualmente la obra "${artwork.title}"?`;
        correctAnswer = artwork.location || 'Ubicación desconocida';
        incorrectOptions = artworks.filter((a) => a.location !== artwork.location).map((a) => a.location || 'Ubicación desconocida');
      } else if (randomType === 'chronology') {
        questionText = `¿Cuál es la cronología o siglo asignado a "${artwork.title}"?`;
        correctAnswer = artwork.chronology;
        incorrectOptions = artworks.filter((a) => a.chronology && a.chronology !== artwork.chronology).map((a) => a.chronology);
      } else if (randomType === 'period') {
        questionText = `¿A qué período o escuela pertenece la obra "${artwork.title}"?`;
        correctAnswer = artwork.period;
        incorrectOptions = artworks.filter((a) => a.period && a.period !== artwork.period).map((a) => a.period);
      } else if (randomType === 'context') {
        questionText = `¿Qué contexto histórico describe mejor a "${artwork.title}"?`;
        correctAnswer = artwork.context;
        incorrectOptions = artworks.filter((a) => a.context && a.context !== artwork.context).map((a) => a.context);
      } else if (randomType === 'analysis') {
        questionText = `¿Qué análisis formal o iconográfico corresponde a "${artwork.title}"?`;
        correctAnswer = artwork.analysis;
        incorrectOptions = artworks.filter((a) => a.analysis && a.analysis !== artwork.analysis).map((a) => a.analysis);
      }

      const uniqueIncorrect = [...new Set(incorrectOptions)];
      const randomIncorrect = shuffleArray(uniqueIncorrect).slice(0, 3);

      while (randomIncorrect.length < 3) {
        randomIncorrect.push('Información no disponible');
      }

      const options = shuffleArray([correctAnswer, ...randomIncorrect]);

      return {
        image: artwork.imageUrl || artwork.imageurl,
        question: questionText,
        options: options,
        answer: correctAnswer,
      };
    });

    setQuestions(generatedQuestions);
  };

  useEffect(() => {
    generateQuiz();
  }, [artworks]);

  const handleNextQuestion = () => {
    if (selectedOption === questions[currentQuestionIndex].answer) {
      setScore(score + 1);
    }
    setSelectedOption(null);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResult(true);
    }
  };

  const restartQuiz = () => {
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    generateQuiz();
  };

  if (questions.length === 0) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.card} onClick={(e) => e.stopPropagation()}>
          <p style={{ color: '#fff' }}>Cargando preguntas académicas...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose} title="Cerrar Examen (ESC)">
          ✕
        </button>

        {!showResult ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingRight: '2.5rem' }}>
              <span style={styles.badge}>Pregunta {currentQuestionIndex + 1} de {questions.length}</span>
            </div>

            {currentQ.image && (
              <div style={styles.imageContainer}>
                <img
                  src={currentQ.image || FALLBACK_IMAGE}
                  alt="Imagen de referencia"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    if (e.target.src !== FALLBACK_IMAGE) e.target.src = FALLBACK_IMAGE;
                  }}
                  style={styles.image}
                />
              </div>
            )}

            <h3 style={styles.questionText}>{currentQ.question}</h3>

            <div style={styles.optionsGrid}>
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === option;
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedOption(option)}
                    style={{
                      ...styles.optionBtn,
                      ...(isSelected ? styles.optionBtnSelected : {}),
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                disabled={!selectedOption}
                onClick={handleNextQuestion}
                style={{
                  ...styles.primaryBtn,
                  opacity: selectedOption ? 1 : 0.5,
                  cursor: selectedOption ? 'pointer' : 'not-allowed',
                  flex: 2,
                }}
              >
                {currentQuestionIndex + 1 === questions.length ? 'Finalizar' : 'Siguiente Pregunta'}
              </button>
              <button onClick={onClose} style={styles.secondaryBtn}>
                Salir
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#fff', marginBottom: '1rem' }}>
              ¡Examen Finalizado!
            </h2>
            <p style={{ fontSize: '1.25rem', color: '#f59e0b', marginBottom: '1rem' }}>
              Puntuación: <strong>{score} / {questions.length}</strong>
            </p>
            <p style={{ color: '#d1d5db', marginBottom: '1.5rem' }}>
              {score === questions.length
                ? '¡Perfecto! Dominas por completo la teoría y el análisis de las obras.'
                : score >= 3
                ? '¡Buen trabajo! Tienes sólidos conocimientos académicos.'
                : 'Sigue practicando repasando las fichas técnicas en el catálogo.'}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={restartQuiz} style={styles.primaryBtn}>Reintentar</button>
              <button onClick={onClose} style={styles.secondaryBtn}>Cerrar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '1rem',
  },
  card: {
    position: 'relative',
    backgroundColor: '#18181b',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#27272a',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '550px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
  },
  closeBtn: {
    position: 'absolute',
    top: '1.25rem',
    right: '1.25rem',
    background: '#27272a',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#3f3f46',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    color: '#ffffff',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  badge: {
    display: 'inline-block',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    color: '#f59e0b',
    fontSize: '0.85rem',
    fontWeight: '600',
    padding: '4px 12px',
    borderRadius: '9999px',
  },
  imageContainer: {
    width: '100%',
    height: '220px',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '1.25rem',
    backgroundColor: '#09090b',
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  questionText: {
    fontSize: '1.15rem',
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: '1.25rem',
    lineHeight: '1.4',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  optionBtn: {
    padding: '0.75rem 1rem',
    backgroundColor: '#27272a',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#3f3f46',
    borderRadius: '8px',
    color: '#e4e4e7',
    textAlign: 'left',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  optionBtnSelected: {
    backgroundColor: '#f59e0b',
    borderColor: '#f59e0b',
    color: '#000000',
    fontWeight: 'bold',
  },
  primaryBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f59e0b',
    border: 'none',
    borderRadius: '8px',
    color: '#000',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  secondaryBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#27272a',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#3f3f46',
    borderRadius: '8px',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer',
    flex: 1,
  },
};