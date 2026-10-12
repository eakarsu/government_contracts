const express = require('express');
const auth = require('../middleware/auth');
const runtimeDb = require('../services/runtimeDb');

const router = express.Router();
router.get('/history', auth, async (req, res) => {
  if (!runtimeDb.enabled()) return res.status(503).json({ error: 'Saved AI history is unavailable' });
  try { return res.json(await runtimeDb.listAi(req.user.id)); }
  catch (error) { return res.status(500).json({ error: 'Saved AI history could not be loaded' }); }
});
router.get('/history/:id', auth, async (req, res) => {
  if (!runtimeDb.enabled()) return res.status(503).json({ error: 'Saved AI history is unavailable' });
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(req.params.id)) return res.status(400).json({ error: 'Invalid report ID' });
  try {
    const item = await runtimeDb.getAi(req.user.id, req.params.id);
    return item ? res.json(item) : res.status(404).json({ error: 'Report not found' });
  } catch (error) { return res.status(500).json({ error: 'Saved report could not be loaded' }); }
});
router.post('/contract-advice', auth, async (req, res) => {
  try {
    const prompt = String(req.body?.prompt || '').trim();
    if (!prompt) return res.status(400).json({ error: 'prompt is required' });
    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseUrl = process.env.OPENROUTER_BASE_URL;
    const model = process.env.OPENROUTER_MODEL;
    if (!apiKey || !baseUrl || !model) return res.status(503).json({ error: 'OpenRouter is not configured' });
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'Provide concise government contracting guidance with compliance risks, evidence needs, and concrete next actions.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(45_000),
    });
    if (!response.ok) return res.status(502).json({ error: `OpenRouter returned ${response.status}` });
    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) return res.status(502).json({ error: 'OpenRouter returned empty content' });
    const persistedId = await runtimeDb.saveAi({ userId: req.user.id, prompt, content, model });
    return res.json({ content, provider: 'openrouter', model, persistedId });
  } catch (error) {
    return res.status(502).json({ error: error instanceof Error ? error.message : 'AI request failed' });
  }
});
module.exports = router;
