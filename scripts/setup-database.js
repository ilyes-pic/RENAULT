const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up database...');

async function runCommand(command, args = [], options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...options
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function main() {
  try {
    // Check if .env.local exists
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
      console.log('⚠️  .env.local not found. Please create it with your DATABASE_URL');
      return;
    }

    console.log('📦 Installing dependencies...');
    await runCommand('pnpm', ['install']);

    console.log('🔄 Generating Prisma client...');
    await runCommand('npx', ['prisma', 'generate']);

    console.log('📋 Pushing database schema...');
    await runCommand('npx', ['prisma', 'db', 'push']);

    console.log('🌱 Seeding database...');
    await runCommand('npx', ['tsx', 'prisma/seed.ts']);

    console.log('✅ Database setup complete!');
    console.log('🚀 You can now run: pnpm dev');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();