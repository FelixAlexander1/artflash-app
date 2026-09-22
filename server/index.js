import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import db from './database.js';

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
// GET: Obtener todas las obras (Corregido con alias AS "imageUrl")
// GET: Obtener todas las obras
app.get('/api/artworks', async (req, res) => {
  try {
    const query = `
      SELECT id, title, artist, year, style, location, imageurl AS "imageUrl", notes 
      FROM artworks 
      ORDER BY id DESC
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener obras:', error);
    res.status(500).json({ error: 'Error al obtener las obras' });
  }
});

// POST: Agregar una nueva obra (Protegida)
app.post('/api/artworks', verifyTeacher, async (req, res) => {
  const { title, artist, year, style, location, imageUrl, notes } = req.body;

  if (!title || !artist || !imageUrl) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  const id = Date.now().toString();

  try {
    const query = `
      INSERT INTO artworks (id, title, artist, year, style, location, imageurl, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, title, artist, year, style, location, imageurl AS "imageUrl", notes;
    `;
    const values = [id, title, artist, year, style, location, imageUrl, notes];
    const result = await db.query(query, values);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al guardar obra:', error);
    res.status(500).json({ error: 'Error al guardar la obra' });
  }
});

// PUT: Actualizar una obra por ID (Protegida)
app.put('/api/artworks/:id', verifyTeacher, async (req, res) => {
  const { id } = req.params;
  // Extraemos imageUrl o imageurl por si se envía con diferente nombre desde el cliente:
  const { title, artist, year, style, location, notes } = req.body;
  const imageUrl = req.body.imageUrl || req.body.imageurl;

  try {
    const query = `
      UPDATE artworks 
      SET title = $1, artist = $2, year = $3, style = $4, location = $5, imageurl = $6, notes = $7
      WHERE id = $8
      RETURNING id, title, artist, year, style, location, imageurl AS "imageUrl", notes;
    `;
    const values = [title, artist, year, style, location, imageUrl, notes, id];
    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Obra no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar obra:', error);
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
        notes: `Obra perteneciente al departamento de ${item.department}. Período: ${item.period || 'No especificado'}.`,
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

// --- 5. INICIAR SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor API corriendo en http://localhost:${PORT}`);
});