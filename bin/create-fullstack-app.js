#!/usr/bin/env node

const execa = require('execa');
const fs = require('fs-extra');
const path = require('path');

async function createFullstackApp(appName) {
  const chalk = (await import('chalk')).default;
  const ora = (await import('ora')).default;
  const appDir = path.join(process.cwd(), appName);
  const clientDir = path.join(appDir, 'client');
  const serverDir = path.join(appDir, 'server');

  // Create directories
  fs.ensureDirSync(appDir);
  fs.ensureDirSync(clientDir);
  fs.ensureDirSync(serverDir);

  // Initialize Next.js app with predefined answers to prompts
  console.log(chalk.green('Creating Next.js app...'));
  const nextSpinner = ora('Initializing Next.js app').start();
  await execa('npx', [
    'create-next-app@latest',
    clientDir,
    '--use-npm',           // Use npm
    '--ts',                // Use TypeScript
    '--eslint',            // Use ESLint
    '--tailwind',          // Use Tailwind CSS
    '--src-dir',           // Use src/ directory
    '--app',               // Use App Router (recommended)
    '--import-alias', '@/*'// Customize the default import alias
  ], { stdio: 'inherit' });
  nextSpinner.succeed('Next.js app initialized');

  // Initialize Express.js app
  console.log(chalk.green('Setting up Express.js app...'));
  const expressSpinner = ora('Initializing Express.js app').start();
  await execa('npm', ['init', '-y'], { cwd: serverDir, stdio: 'inherit' });
  await execa('npm', ['install', 'express'], { cwd: serverDir, stdio: 'inherit' });
  expressSpinner.succeed('Express.js app initialized');

  // Create basic server file
  const serverFileContent = `
  const express = require('express');
  const app = express();
  const port = process.env.PORT || 3001;

  app.get('/', (req, res) => {
    res.send('Hello from Express!');
  });

  app.listen(port, () => {
    console.log(\`Server is running on port \${port}\`);
  });
  `;
  fs.writeFileSync(path.join(serverDir, 'index.js'), serverFileContent);

  console.log(chalk.green('Fullstack app setup complete!'));
  console.log(chalk.blue(`Next.js app created in ${clientDir}`));
  console.log(chalk.blue(`Express.js app created in ${serverDir}`));
}

const appName = process.argv[2];
if (!appName) {
  console.error(chalk.red('Please provide an app name.'));
  process.exit(1);
}

createFullstackApp(appName).catch((err) => {
  console.error(chalk.red(err));
  process.exit(1);
});