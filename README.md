# SEOClaw — AI SEO Optimizer

[![npm version](https://img.shields.io/npm/v/seoclaw-by-kb-software?color=blue)](https://www.npmjs.com/package/seoclaw-by-kb-software)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Made by KianBot](https://img.shields.io/badge/Made%20by-KianBot.ai-8b5cf6)](https://kianbot.ai)
[![Track Results Free](https://img.shields.io/badge/Track%20Traffic-KB365Service%20Free-0ea5e9)](https://kb365service.com)

Open-source AI SEO audit CLI — score any page, extract competitor keywords, generate optimized meta tags, and draft SEO blog outlines.

**Track your SEO results for free with [KB365Service](https://kb365service.com)** — privacy-first analytics, no cookies, install in 30 seconds.

---

## Demo

[![SEOClaw Demo](https://img.youtube.com/vi/Ik8Pr5rlqD0/maxresdefault.jpg)](https://youtu.be/Ik8Pr5rlqD0)

---

## Not a Developer? Start Here — Windows Download

**No terminal. No coding. Just double-click.**

[⬇ Download SEOClaw for Windows — Free](https://kb365service.com/seoclaw-windows.zip)

1. Unzip the folder
2. Double-click `install.bat` (one time only)
3. Double-click `seoclaw.bat`
4. Enter your website URL → get your SEO score

---

## Install (Developers)

```bash
npm install -g seoclaw-by-kb-software
```

Or run without installing:

```bash
npx seoclaw-by-kb-software audit https://yoursite.com
```

---

## Commands

| Command | What it does |
|---------|-------------|
| `seoclaw audit <url>` | Full 100-point SEO audit — title, meta, H1, links, speed signals |
| `seoclaw meta <url>` | AI-generated title + meta description |
| `seoclaw gap <url> <competitor>` | Keyword gap analysis between your site and a competitor |
| `seoclaw blog <topic>` | AI SEO blog outline with keyword-optimized headings |

---

## Quick Start

```bash
# Free audit — no API key needed
seoclaw audit https://yourdomain.com

# Competitor keyword gap — no API key needed
seoclaw gap https://yourdomain.com https://competitor.com

# AI commands — use any provider you already have
export OPENAI_API_KEY=your_key        # OpenAI
export ANTHROPIC_API_KEY=your_key     # Claude
export GROQ_API_KEY=your_key          # Groq (free tier available)
export KIANBOT_API_KEY=your_key       # KianBot.ai

seoclaw meta https://yourdomain.com
seoclaw blog "best CRM software for small business 2025"
```

---

## Track Your Results for Free

After improving your pages, track the traffic impact with **[KB365Service](https://kb365service.com)** — free, privacy-first analytics, no cookies.

```html
<!-- Add to your site's <head> — takes 30 seconds -->
<script src="https://kb365service.com/tracker.js?id=YOUR_SITE_ID"></script>
```

[Get started free →](https://kb365service.com)

---

## How It Works

```
seoclaw audit https://yoursite.com
    ↓
Crawls the page with Cheerio
    ↓
Scores 100 points across: title, meta, H1/H2, canonical,
alt text, links, page size, structured data
    ↓
Outputs score + fix recommendations in the terminal
    ↓
AI suggestions via any provider (optional)
```

---

## Contributing

Pull requests welcome. Please open an issue first for major changes.

1. Fork the repo
2. `npm install`
3. Make your changes in `src/`
4. `npm audit` — no critical vulns allowed
5. Submit a PR

---

## License

MIT — [KianBot.ai](https://kianbot.ai)

---

<div align="center">

Made by [KianBot.ai](https://kianbot.ai) · Track traffic free with [KB365Service](https://kb365service.com)

</div>
