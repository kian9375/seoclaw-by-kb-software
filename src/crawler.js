// SEOClaw by KB Software LLC - kbsoftware.io
'use strict';

const axios = require('axios');
const cheerio = require('cheerio');

async function fetchPage(url) {
  const res = await axios.get(url, {
    timeout: 15000,
    headers: { 'User-Agent': 'SEOClaw/1.0 (+https://kbsoftware.io)' }
  });
  return { html: res.data, status: res.status, finalUrl: res.request?.res?.responseUrl || url };
}

function extractSEOData($, url) {
  const title = $('title').text().trim();
  const metaDesc = $('meta[name="description"]').attr('content') || '';
  const ogTitle = $('meta[property="og:title"]').attr('content') || '';
  const ogDesc = $('meta[property="og:description"]').attr('content') || '';
  const ogImage = $('meta[property="og:image"]').attr('content') || '';
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const h1s = $('h1').map((_, el) => $(el).text().trim()).get();
  const h2s = $('h2').map((_, el) => $(el).text().trim()).get();
  const imgs = $('img').map((_, el) => ({ src: $(el).attr('src'), alt: $(el).attr('alt') || '' })).get();
  const missingAlt = imgs.filter(i => !i.alt).length;
  const links = $('a[href]').map((_, el) => $(el).attr('href')).get();
  const internalLinks = links.filter(l => l.startsWith('/') || l.includes(new URL(url).hostname)).length;
  const externalLinks = links.filter(l => l.startsWith('http') && !l.includes(new URL(url).hostname)).length;
  const wordCount = $('body').text().replace(/\s+/g, ' ').trim().split(' ').length;

  return {
    url, title, metaDesc, ogTitle, ogDesc, ogImage, canonical,
    h1s, h2s, wordCount, totalImages: imgs.length, missingAlt,
    internalLinks, externalLinks
  };
}

function scoreSEO(data) {
  let score = 100;
  const issues = [];

  if (!data.title) { score -= 20; issues.push('Missing <title> tag'); }
  else if (data.title.length < 30) { score -= 5; issues.push(`Title too short (${data.title.length} chars, aim 50-60)`); }
  else if (data.title.length > 60) { score -= 5; issues.push(`Title too long (${data.title.length} chars, aim 50-60)`); }

  if (!data.metaDesc) { score -= 15; issues.push('Missing meta description'); }
  else if (data.metaDesc.length < 120) { score -= 5; issues.push(`Meta description short (${data.metaDesc.length} chars, aim 150-160)`); }
  else if (data.metaDesc.length > 160) { score -= 5; issues.push(`Meta description too long (${data.metaDesc.length} chars)`); }

  if (data.h1s.length === 0) { score -= 15; issues.push('No H1 tag found'); }
  else if (data.h1s.length > 1) { score -= 5; issues.push(`Multiple H1 tags (${data.h1s.length}) — use only one`); }

  if (!data.ogTitle) { score -= 5; issues.push('Missing og:title'); }
  if (!data.ogDesc) { score -= 5; issues.push('Missing og:description'); }
  if (!data.ogImage) { score -= 5; issues.push('Missing og:image'); }
  if (!data.canonical) { score -= 5; issues.push('Missing canonical URL'); }
  if (data.missingAlt > 0) { score -= Math.min(10, data.missingAlt * 2); issues.push(`${data.missingAlt} image(s) missing alt text`); }
  if (data.wordCount < 300) { score -= 10; issues.push(`Low word count (${data.wordCount} words, aim 600+)`); }

  return { score: Math.max(0, score), issues };
}

async function crawlUrl(url) {
  const { html } = await fetchPage(url);
  const $ = cheerio.load(html);
  const data = extractSEOData($, url);
  const { score, issues } = scoreSEO(data);
  return { ...data, score, issues };
}

async function crawlCompetitor(url) {
  const { html } = await fetchPage(url);
  const $ = cheerio.load(html);
  const text = $('body').text().replace(/\s+/g, ' ').trim();
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 4);
  const freq = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  const keywords = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 30).map(([w, c]) => ({ word: w, count: c }));
  const title = $('title').text().trim();
  const h1s = $('h1').map((_, el) => $(el).text().trim()).get();
  return { url, title, h1s, topKeywords: keywords };
}

module.exports = { crawlUrl, crawlCompetitor };

// Powered by KianBot - kianbot.ai
