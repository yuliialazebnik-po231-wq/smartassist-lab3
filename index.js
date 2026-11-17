import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Підключення OpenAPI (Swagger) документації
const swaggerDocument = YAML.load('./openapi.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Ваше підключення до Supabase (PostgreSQL)
const supabaseUrl = 'https://ofuexuqytqetqlhnlbbs.supabase.co';
const supabaseKey = 'sb_publishable_ukK1AxpHv51rNjQN00pNNQ_CtG0tT4V';
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. GET — отримати всі нотатки
app.get('/api/notes', async (req, res) => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('id', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 2. POST — додати нову нотатку
app.post('/api/notes', async (req, res) => {
  const { title, content } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Заголовок обов’язковий' });
  }

  const { data, error } = await supabase
    .from('notes')
    .insert([{ title, content }])
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

// 3. DELETE — видалити нотатку
app.delete('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Нотатку видалено', id });
});

app.listen(PORT, () => {
  console.log(`Сервер SmartAssist запущено: http://localhost:${PORT}`);
  console.log(`OpenAPI документація: http://localhost:${PORT}/api-docs`);
});