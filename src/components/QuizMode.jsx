import React, { useState, useEffect } from 'react';

export function QuizMode({ artworks, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  
  // 1. Guardamos el historial de IDs de obras ya utilizadas en los test
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

    // 2. Filtramos para usar solo obras que NO hayan sido preguntadas antes
    let availableArtworks = artworks.filter((a) => !usedArtworkIds.includes(a.id));

    // Si ya se hicieron preguntas sobre todas las obras, reiniciamos el historial
    if (availableArtworks.length < 3) {
      availableArtworks = artworks;
      setUsedArtworkIds([]);
    }

    const shuffledAvailable = shuffleArray(availableArtworks);
    const selectedForQuiz = shuffledAvailable.slice(0, 5); // Tomamos máximo 5 obras

    // 3. Registramos los IDs de las obras elegidas en este test
    const newUsedIds = selectedForQuiz.map((a) => a.id);
    setUsedArtworkIds((prev) => [...prev, ...newUsedIds]);

    const generatedQuestions = selectedForQuiz.map((artwork) => {
      const questionTypes = ['artist', 'year', 'style', 'location'];
      const randomType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

      let questionText = '';
      let correctAnswer = '';
      let incorrectOptions = [];

      if (randomType === 'artist') {
        questionText = `¿Quién pintó la obra "${artwork.title}"?`;
        correctAnswer = artwork.artist;
        incorrectOptions = artworks.filter((a) => a.artist !== artwork.artist).map((a) => a.artist);
      } else if (randomType === 'year') {
        questionText = `¿En qué año se creó la obra "${artwork.title}" de ${artwork.artist}?`;
        correctAnswer = artwork.year.toString();
        incorrectOptions = artworks.filter((a) => a.year !== artwork.year).map((a) => a.year.toString());
      } else if (randomType === 'style') {
        questionText = `¿A qué estilo o movimiento artístico pertenece "${artwork.title}"?`;
        correctAnswer = artwork.style;
        incorrectOptions = artworks.filter((a) => a.style !== artwork.style).map((a) => a.style);
      } else if (randomType === 'location') {
        questionText = `¿Dónde se encuentra actualmente la obra "${artwork.title}"?`;
        correctAnswer = artwork.location;
        incorrectOptions = artworks.filter((a) => a.location !== artwork.location).map((a) => a.location);
      }

      const uniqueIncorrect = [...new Set(incorrectOptions)];
      const randomIncorrect = shuffleArray(uniqueIncorrect).slice(0, 3);

      while (randomIncorrect.length < 3) {
        randomIncorrect.push('Información no disponible');
      }

      const options = shuffleArray([correctAnswer, ...randomIncorrect]);

      return {
        image: artwork.imageUrl,
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
          <p style={{ color: '#fff' }}>Cargando preguntas...</p>
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
                ? '¡Perfecto! Eres todo un experto en arte.'
                : score >= 3
                ? '¡Buen trabajo! Tienes sólidos conocimientos.'
                : 'Sigue practicando revisando las tarjetas de arte.'}
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