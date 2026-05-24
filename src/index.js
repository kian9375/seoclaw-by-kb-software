#!/usr/bin/env node
// SEOClaw by KB Software LLC - kbsoftware.io
'use strict';

require('dotenv').config();
const { Command } = require('commander');
const ora = require('ora');
const KianBotClient = require('./kianbot');
const { crawlUrl, crawlCompetitor } = require('./crawler');
const { printAudit, printMeta, printKeywordGap, printBlog } = require('./output');

const program = new Command();

program
  .name('seoclaw')
  .description('SEOClaw — AI SEO Agent by KB Software LLC | Powered by KianBot')
  .version('1.0.0');

function getClient() {
  const key = process.env.KIANBOT_API_KEY;
  if (!key) {
    console.error('Error: KIANBOT_API_KEY not set. Get yours at kianbot.ai');
    process.exit(1);
  }
  return new KianBotClient(key, process.env.KIANBOT_API_URL);
}

// 1. SEO Audit
program
  .command('audit <url>')
  .description('Crawl a URL and score its SEO health')
  .action(async (url) => {
    const spinner = ora(`Auditing ${url}...`).start();
    try {
      const result = await crawlUrl(url);
      spinner.stop();
      printAudit(result);
    } catch (e) {
      spinner.fail(`Failed: ${e.message}`);
    }
  });

// 2. Generate meta tags
program
  .command('meta <url>')
  .description('Auto-generate meta title, description, and OG tags for a URL')
  .action(async (url) => {
    const spinner = ora(`Generating meta tags for ${url}...`).start();
    try {
      const kb = getClient();
      const page = await crawlUrl(url);
      const prompt = `You are an expert SEO copywriter. Based on this page data, generate optimized meta tags.
Page URL: ${url}
Current title: ${page.title || 'none'}
Current description: ${page.metaDesc || 'none'}
H1: ${page.h1s[0] || 'none'}
Word count: ${page.wordCount}

Return JSON only with keys: title (50-60 chars), description (150-160 chars), ogTitle (60 chars max), ogDesc (200 chars max), ogImagePrompt (describe ideal OG image).`;
      const raw = await kb.chat(prompt);
      const json = raw.match(/\{[\s\S]+\}/)?.[0];
      const meta = json ? JSON.parse(json) : { title: raw };
      spinner.stop();
      printMeta(meta);
    } catch (e) {
      spinner.fail(`Failed: ${e.message}`);
    }
  });

// 3. Keyword gap analysis
program
  .command('gap <myUrl> <competitorUrl>')
  .description('Keyword gap analysis — find what your competitor ranks for that you don\'t')
  .action(async (myUrl, competitorUrl) => {
    const spinner = ora('Analyzing keyword gap...').start();
    try {
      const [myData, compData] = await Promise.all([
        crawlUrl(myUrl),
        crawlCompetitor(competitorUrl)
      ]);
      spinner.stop();
      printKeywordGap(myData, compData);
    } catch (e) {
      spinner.fail(`Failed: ${e.message}`);
    }
  });

// 4. Blog draft
program
  .command('blog <topic>')
  .description('Generate an SEO-optimized blog post draft on any topic')
  .option('-w, --words <n>', 'Target word count', '800')
  .action(async (topic, opts) => {
    const spinner = ora(`Writing SEO blog on: "${topic}"...`).start();
    try {
      const kb = getClient();
      const prompt = `Write an SEO-optimized blog post about: "${topic}"
Target length: ~${opts.words} words
Include:
- Compelling H1 title
- Meta description (150-160 chars) at the top labeled "META:"
- Proper H2/H3 subheadings
- Natural keyword usage throughout
- Actionable conclusion with CTA
Format in clean markdown.`;
      const content = await kb.chat(prompt);
      spinner.stop();
      printBlog(content);
    } catch (e) {
      spinner.fail(`Failed: ${e.message}`);
    }
  });

// 5. WordPress push
program
  .command('wp-push <url>')
  .description('Push a generated blog post to WordPress via REST API')
  .requiredOption('-t, --title <title>', 'Post title')
  .requiredOption('-c, --content <content>', 'Post content (markdown or HTML)')
  .option('-s, --status <status>', 'Post status (draft|publish)', 'draft')
  .action(async (url, opts) => {
    const wpUrl = process.env.WP_URL;
    const wpUser = process.env.WP_USER;
    const wpPass = process.env.WP_APP_PASSWORD;
    if (!wpUrl || !wpUser || !wpPass) {
      console.error('Error: Set WP_URL, WP_USER, WP_APP_PASSWORD in .env');
      process.exit(1);
    }
    const spinner = ora(`Pushing to WordPress at ${wpUrl}...`).start();
    try {
      const axios = require('axios');
      const auth = Buffer.from(`${wpUser}:${wpPass}`).toString('base64');
      const res = await axios.post(`${wpUrl}/wp-json/wp/v2/posts`, {
        title: opts.title,
        content: opts.content,
        status: opts.status
      }, { headers: { Authorization: `Basic ${auth}` } });
      spinner.succeed(`Post created! ID: ${res.data.id} | URL: ${res.data.link}`);
    } catch (e) {
      spinner.fail(`WordPress push failed: ${e.response?.data?.message || e.message}`);
    }
  });

program.parse();

// Powered by KianBot - kianbot.ai
