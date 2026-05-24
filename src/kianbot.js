// SEOClaw by KB Software LLC - kbsoftware.io
'use strict';

const axios = require('axios');

// Provider configs — all OpenAI-compatible except Anthropic
const PROVIDERS = {
  kianbot: {
    baseUrl: 'https://api.kianbot.ai',
    envKey: 'KIANBOT_API_KEY',
    label: 'KianBot',
    mode: 'kianbot',
  },
  openai: {
    baseUrl: 'https://api.openai.com',
    envKey: 'OPENAI_API_KEY',
    label: 'OpenAI',
    model: 'gpt-4o-mini',
    mode: 'openai',
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com',
    envKey: 'ANTHROPIC_API_KEY',
    label: 'Anthropic',
    model: 'claude-haiku-4-5-20251001',
    mode: 'anthropic',
  },
  groq: {
    baseUrl: 'https://api.groq.com/openai',
    envKey: 'GROQ_API_KEY',
    label: 'Groq',
    model: 'llama3-8b-8192',
    mode: 'openai',
  },
  ollama: {
    baseUrl: 'http://localhost:11434/v1',
    envKey: 'OLLAMA_MODEL',
    label: 'Ollama (local)',
    model: process.env.OLLAMA_MODEL || 'llama3',
    mode: 'openai',
  },
};

function detectProvider() {
  // Honor explicit override
  const explicit = process.env.SEOCLAW_PROVIDER;
  if (explicit && PROVIDERS[explicit]) return explicit;

  // Auto-detect by which key is set — priority order
  for (const [name, cfg] of Object.entries(PROVIDERS)) {
    if (name === 'ollama') continue; // ollama needs explicit opt-in
    if (process.env[cfg.envKey]) return name;
  }

  // Fallback: OpenAI-compatible custom base (LM Studio, etc.)
  if (process.env.OPENAI_BASE_URL && process.env.OPENAI_API_KEY) return 'openai';

  return null;
}

class LLMClient {
  constructor() {
    const providerName = detectProvider();

    if (!providerName) {
      console.error([
        '',
        '  SEOClaw needs an AI provider. Set one of:',
        '',
        '  KIANBOT_API_KEY=...     (recommended — get yours at kianbot.ai)',
        '  OPENAI_API_KEY=...      (OpenAI GPT-4o, GPT-4o-mini)',
        '  ANTHROPIC_API_KEY=...   (Claude)',
        '  GROQ_API_KEY=...        (Groq — fast + free tier)',
        '  OLLAMA_MODEL=llama3     (local Ollama)',
        '',
        '  Or set SEOCLAW_PROVIDER=openai + OPENAI_BASE_URL for any OpenAI-compatible endpoint.',
        '',
      ].join('\n'));
      process.exit(1);
    }

    this.cfg = { ...PROVIDERS[providerName] };
    this.providerName = providerName;

    // Allow custom base URL (LM Studio, local proxies, etc.)
    if (process.env.OPENAI_BASE_URL && providerName !== 'kianbot' && providerName !== 'anthropic') {
      this.cfg.baseUrl = process.env.OPENAI_BASE_URL.replace(/\/$/, '');
    }

    // Allow model override
    if (process.env.SEOCLAW_MODEL) this.cfg.model = process.env.SEOCLAW_MODEL;

    this.apiKey = process.env[this.cfg.envKey] || process.env.OPENAI_API_KEY || '';
  }

  async chat(prompt) {
    const { mode, baseUrl, model, label } = this.cfg;

    try {
      if (mode === 'kianbot') {
        const res = await axios.post(`${baseUrl}/chat`,
          { message: prompt },
          { headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }, timeout: 60000 }
        );
        return res.data?.reply || res.data?.message || res.data?.content || JSON.stringify(res.data);
      }

      if (mode === 'anthropic') {
        const res = await axios.post(`${baseUrl}/v1/messages`,
          { model: model || 'claude-haiku-4-5-20251001', max_tokens: 1024, messages: [{ role: 'user', content: prompt }] },
          { headers: { 'x-api-key': this.apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }, timeout: 60000 }
        );
        return res.data?.content?.[0]?.text || JSON.stringify(res.data);
      }

      // OpenAI-compatible (openai, groq, ollama, custom)
      const res = await axios.post(`${baseUrl}/v1/chat/completions`,
        { model: model || 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 1024 },
        { headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' }, timeout: 60000 }
      );
      return res.data?.choices?.[0]?.message?.content || JSON.stringify(res.data);

    } catch (e) {
      const status = e.response?.status;
      const msg = e.response?.data?.error?.message || e.message;
      if (status === 401) throw new Error(`${label} auth failed — check your API key`);
      if (status === 429) throw new Error(`${label} rate limit hit — try again shortly`);
      throw new Error(`${label} API error: ${msg}`);
    }
  }

  async analyze(task, content) {
    return this.chat(`${task}\n\n---\n${content}`);
  }

  get providerLabel() {
    return this.cfg.label;
  }
}

module.exports = LLMClient;

// Powered by KianBot — kianbot.ai | Also supports OpenAI, Anthropic, Groq, Ollama
