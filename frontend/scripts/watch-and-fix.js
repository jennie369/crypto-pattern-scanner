#!/usr/bin/env node
import { spawn } from 'child_process';

let viteProcess;
const errorBuffer = [];

console.log('🚀 Starting Vite with Console Monitor + Auto-Fix Mode...\n');

// Start Vite with output capture
viteProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'pipe',
  shell: true,
});

// Watch Vite output
viteProcess.stdout.on('data', (data) => {
  const output = data.toString();
  process.stdout.write(output);

  // Detect browser errors
  if (output.includes('❌ Browser Error:')) {
    errorBuffer.push(output);

    // Trigger Claude Code fix after collecting errors
    setTimeout(() => {
      if (errorBuffer.length > 0) {
        console.log('\n🤖 Detected browser errors! Calling Claude Code to fix...\n');
        console.log('─'.repeat(60));
        console.log('Errors detected:');
        errorBuffer.forEach((err, i) => {
          console.log(`${i + 1}. ${err.trim()}`);
        });
        console.log('─'.repeat(60));

        const prompt = `Fix these browser console errors:\n${errorBuffer.join('\n')}`;

        // Try to call claude-code CLI
        const claudeProcess = spawn('claude', ['--print', prompt], {
          stdio: 'inherit',
          shell: true,
        });

        claudeProcess.on('error', () => {
          console.log('\n⚠️  Claude CLI not available. Please fix manually or run:');
          console.log(`   claude "Fix these errors: ${errorBuffer.join('; ')}"`);
        });

        errorBuffer.length = 0;
      }
    }, 2000); // Wait 2s for more errors
  }
});

viteProcess.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

viteProcess.on('close', (code) => {
  console.log(`\n📦 Vite process exited with code ${code}`);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  viteProcess.kill();
  process.exit(0);
});
