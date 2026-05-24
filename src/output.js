// SEOClaw by KB Software LLC - kbsoftware.io
'use strict';

const chalk = require('chalk');

function scoreColor(score) {
  if (score >= 80) return chalk.green(score);
  if (score >= 50) return chalk.yellow(score);
  return chalk.red(score);
}

function printAudit(result) {
  console.log('\n' + chalk.bold.cyan('━━━ SEO Audit Report ━━━'));
  console.log(chalk.bold('URL:    ') + result.url);
  console.log(chalk.bold('Score:  ') + scoreColor(result.score) + '/100');
  console.log(chalk.bold('Title:  ') + (result.title || chalk.red('MISSING')));
  console.log(chalk.bold('H1:     ') + (result.h1s[0] || chalk.red('MISSING')));
  console.log(chalk.bold('Words:  ') + result.wordCount);

  if (result.issues.length > 0) {
    console.log('\n' + chalk.bold.yellow('Issues:'));
    result.issues.forEach(i => console.log('  ' + chalk.yellow('⚠') + '  ' + i));
  } else {
    console.log('\n' + chalk.green('✓ No issues found'));
  }
  console.log('');
}

function printMeta(meta) {
  console.log('\n' + chalk.bold.cyan('━━━ Generated Meta Tags ━━━'));
  console.log(chalk.bold('Title:       ') + meta.title);
  console.log(chalk.bold('Description: ') + meta.description);
  console.log(chalk.bold('OG Title:    ') + meta.ogTitle);
  console.log(chalk.bold('OG Desc:     ') + meta.ogDesc);
  if (meta.ogImagePrompt) console.log(chalk.bold('OG Image:    ') + chalk.dim(meta.ogImagePrompt));
  console.log('\n' + chalk.dim('HTML snippet:'));
  console.log(chalk.dim(`<title>${meta.title}</title>`));
  console.log(chalk.dim(`<meta name="description" content="${meta.description}">`));
  console.log(chalk.dim(`<meta property="og:title" content="${meta.ogTitle}">`));
  console.log(chalk.dim(`<meta property="og:description" content="${meta.ogDesc}">`));
  console.log('');
}

function printKeywordGap(myData, compData) {
  console.log('\n' + chalk.bold.cyan('━━━ Keyword Gap Analysis ━━━'));
  console.log(chalk.bold('Your URL:       ') + myData.url);
  console.log(chalk.bold('Competitor URL: ') + compData.url);

  const myWords = new Set(myData.topKeywords?.map(k => k.word) || []);
  const compWords = compData.topKeywords || [];
  const gaps = compWords.filter(k => !myWords.has(k.word)).slice(0, 15);

  console.log('\n' + chalk.bold.yellow('Keywords competitor ranks for that you\'re missing:'));
  gaps.forEach(k => console.log(`  ${chalk.green('+')} ${k.word} (used ${k.count}x by competitor)`));
  console.log('');
}

function printBlog(content) {
  console.log('\n' + chalk.bold.cyan('━━━ SEO Blog Draft ━━━'));
  console.log(content);
  console.log('');
}

module.exports = { printAudit, printMeta, printKeywordGap, printBlog };

// Powered by KianBot - kianbot.ai
