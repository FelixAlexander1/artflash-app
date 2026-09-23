import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import db from './database.js';
import { GoogleGenAI } from '@google/genai';

// Inicializar el SDK de Gemini (usará process.env.GEMINI_API_KEY automáticamente)
const ai = new GoogleGenAI();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// --- 1. USUARIOS AUTORIZADOS ---
const USERS = [
  {
    id: 1,
    email: 'profe@arte.com',
    password: 'profepassword123',
    role: 'teacher',
    name: 'Prof. Sofia Arte',
  },
];

// --- 2. MIDDLEWARE DE AUTENTICACIÓN ---
const verifyTeacher = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer <TOKEN>"

  if (!token) {
    return res.status(401).json({ message: 'Acceso denegado: Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'teacher') {
      return res.status(403).json({ message: 'Acceso denegado: Permisos insuficientes' });
    }
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido o expirado' });
  }
};

// --- 3. ENDPOINT DE LOGIN ---
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = USERS.find((u) => u.email === email && u.password === password);

  if (user) {
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: '24h',
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      success: true,
      token,
      user: userWithoutPassword,
    });
  }

  return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
});

// --- 4. RUTAS DE ARTWORKS ---

// GET: Obtener todas las obras con campos académicos
app.get('/api/artworks', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT id, title, artist, year, style, location, 
             imageurl AS "imageUrl", notes,
             chronology, context, analysis, period
      FROM artworks 
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener obras:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST: Crear una nueva obra
app.post('/api/artworks', async (req, res) => {
  const { title, artist, year, style, location, imageUrl, notes, chronology, context, analysis, period } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO artworks (title, artist, year, style, location, imageurl, notes, chronology, context, analysis, period)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *, imageurl AS "imageUrl"`,
      [title, artist, year, style, location, imageUrl, notes, chronology, context, analysis, period]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear obra:', err);
    res.status(500).json({ error: 'Error al guardar la obra' });
  }
});

// PUT: Actualizar una obra existente
app.put('/api/artworks/:id', async (req, res) => {
  const { id } = req.params;
  const { title, artist, year, style, location, imageUrl, notes, chronology, context, analysis, period } = req.body;
  try {
    const result = await db.query(
      `UPDATE artworks 
       SET title=$1, artist=$2, year=$3, style=$4, location=$5, imageurl=$6, notes=$7, chronology=$8, context=$9, analysis=$10, period=$11
       WHERE id=$12 RETURNING *, imageurl AS "imageUrl"`,
      [title, artist, year, style, location, imageUrl, notes, chronology, context, analysis, period, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar obra:', err);
    res.status(500).json({ error: 'Error al actualizar la obra' });
  }
});

// DELETE: Eliminar una obra por ID (Protegida)
app.delete('/api/artworks/:id', verifyTeacher, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM artworks WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }

    res.json({ message: 'Obra eliminada con éxito', id });
  } catch (error) {
    console.error('Error al eliminar obra:', error);
    res.status(500).json({ error: 'Error al eliminar la obra' });
  }
});

// GET: Buscar obras en la API pública del MET Museum
app.get('/api/external/search', async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: 'Debes proporcionar un término de búsqueda' });

  try {
    const searchRes = await fetch(
      `https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=${encodeURIComponent(q)}`
    );
    const searchData = await searchRes.json();

    if (!searchData.objectIDs || searchData.objectIDs.length === 0) {
      return res.json([]);
    }

    const ids = searchData.objectIDs.slice(0, 6);

    const artworkPromises = ids.map(async (id) => {
      const detailRes = await fetch(
        `https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`
      );
      const item = await detailRes.json();

      return {
        id: `met-${item.objectID}`,
        title: item.title || 'Sin título',
        artist: item.artistDisplayName || 'Artista desconocido',
        year: item.objectDate || 'Desconocido',
        style: item.department || 'Arte Clásico',
        location: item.repository || 'The Met, Nueva York',
        imageUrl: item.primaryImageSmall || item.primaryImage,
        notes: `Obra perteneciente al departamento de ${item.department}.`,
        chronology: item.objectDate || '',
        period: item.period || '',
        context: item.culture ? `Cultura / Contexto: ${item.culture}` : 'Sin contexto especificado.',
        analysis: item.medium ? `Técnica / Materiales: ${item.medium}` : 'Sin análisis especificado.',
      };
    });

    const results = await Promise.all(artworkPromises);
    const validResults = results.filter((art) => art.imageUrl);

    res.json(validResults);
  } catch (error) {
    console.error('Error al consultar Met API:', error);
    res.status(500).json({ error: 'Error al buscar en la API externa' });
  }
});

// --- 5. RUTAS DE IA Y EXÁMENES ---

// POST: Generar análisis académico automático con IA
app.post('/api/ai/analyze-artwork', async (req, res) => {
  const { title, artist } = req.body;

  if (!title || !artist) {
    return res.status(400).json({ error: 'Se requiere el título y el artista para realizar el análisis.' });
  }

  try {
    const prompt = `Actúa como un catedrático experto en Historia del Arte. Analiza la obra de arte titulada "${title}" del artista "${artist}".
    Devuelve la información estrictamente en formato JSON válido con las siguientes claves (sin bloques de código markdown alrededor, solo el JSON puro):
    {
      "year": "Año o fecha aproximada de creación (ej. 1656)",
      "style": "Estilo o movimiento artístico principal (ej. Barroco)",
      "location": "Museo o ubicación actual principal (ej. Museo del Prado, Madrid)",
      "chronology": "Siglo o fecha aproximada detallada (ej. Siglo XVII)",
      "period": "Estilo, movimiento o escuela artística (ej. Barroco / Escuela Española)",
      "context": "Breve contexto histórico de la época en 2 o 3 frases",
      "analysis": "Breve análisis formal e iconográfico (composición, luz, técnica) en 2 o 3 frases",
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    let textResponse = response.text.trim();
    textResponse = textResponse.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

    const analysisData = JSON.parse(textResponse);
    res.json(analysisData);
  } catch (err) {
    console.error('Error al generar análisis con IA:', err);
    res.status(500).json({ error: 'No se pudo generar el análisis automático con IA.' });
  }
});

// POST: Guardar resultado de un examen
app.post('/api/exam-results', async (req, res) => {
  const { user_name, score, total } = req.body;
  const percentage = ((score / total) * 100).toFixed(2);

  try {
    const result = await db.query(
      `INSERT INTO exam_results (user_name, score, total, percentage)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [user_name || 'Estudiante', score, total, percentage]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al guardar resultado de examen:', err);
    res.status(500).json({ error: 'Error al guardar el resultado' });
  }
});

// GET: Obtener historial de resultados
app.get('/api/exam-results', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM exam_results ORDER BY created_at DESC LIMIT 10');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener resultados:', err);
    res.status(500).json({ error: 'Error al obtener el historial' });
  }
});

// --- 6. INICIAR SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor API corriendo en http://localhost:${PORT}`);
});