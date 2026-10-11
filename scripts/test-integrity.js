// Automated Technical Integrity & Physics Verification Suite for Zero-G Notes
const { spawn } = require('child_process');
const path = require('path');
const assert = require('assert');
const Matter = require('matter-js');

console.log('--- Starting Zero-G Notes Integrity Test Suite ---');

// Test 1: Matter.js engine initialization and zero-G physics dynamics
console.log('[Test 1] Verifying Matter.js engine zero-G parameters...');
const engine = Matter.Engine.create();
engine.gravity.x = 0;
engine.gravity.y = 0;
engine.gravity.scale = 0;

const BASE_WIDTH = 250;
const BASE_HEIGHT = 165;
const bodyA = Matter.Bodies.rectangle(400, 300, BASE_WIDTH, BASE_HEIGHT, {
  restitution: 0.94,
  frictionAir: 0.004,
  density: 0.001
});

Matter.Body.setVelocity(bodyA, { x: 2.0, y: -1.5 });
Matter.Composite.add(engine.world, bodyA);

assert(bodyA.position.x === 400, 'Body A X position mismatch');
assert(bodyA.position.y === 300, 'Body A Y position mismatch');
assert(bodyA.velocity.x === 2.0, 'Body A initial Vx mismatch');
assert(bodyA.velocity.y === -1.5, 'Body A initial Vy mismatch');

// Step simulation
Matter.Engine.update(engine, 16.67);
assert(bodyA.position.x > 400, 'Body A should have drifted rightward in zero-g');
assert(bodyA.position.y < 300, 'Body A should have drifted upward in zero-g');
console.log('✓ Matter.js zero-G rigid body kinematics passed.');

// Test 2: Gravity Mode & Floor Dampening
console.log('[Test 2] Verifying Earth Gravity mode & resting state...');
engine.gravity.y = 1.0;
engine.gravity.scale = 0.001;

const floor = Matter.Bodies.rectangle(400, 800, 1000, 50, { isStatic: true, restitution: 0.4 });
Matter.Composite.add(engine.world, floor);

for (let i = 0; i < 60; i++) {
  Matter.Engine.update(engine, 16.67);
}

assert(bodyA.position.y > 300, 'Body should fall under Earth gravity');
console.log('✓ Gravity mode kinematics passed.');

// Test 3: Data Sanitization (Defensive NaN/Infinite checks)
console.log('[Test 3] Verifying coordinate sanitization against corrupted state...');
function sanitizeNoteCoords({ x, y, vx, vy, angle }) {
  return {
    x: Number.isFinite(x) ? x : 300,
    y: Number.isFinite(y) ? y : 300,
    vx: Number.isFinite(vx) ? vx : 0,
    vy: Number.isFinite(vy) ? vy : 0,
    angle: Number.isFinite(angle) ? angle : 0
  };
}

const corrupted = { x: NaN, y: Infinity, vx: null, vy: undefined, angle: NaN };
const cleaned = sanitizeNoteCoords(corrupted);
assert(cleaned.x === 300 && Number.isFinite(cleaned.x), 'Sanitized X must be finite');
assert(cleaned.y === 300 && Number.isFinite(cleaned.y), 'Sanitized Y must be finite');
assert(cleaned.vx === 0 && Number.isFinite(cleaned.vx), 'Sanitized Vx must be 0');
assert(cleaned.vy === 0 && Number.isFinite(cleaned.vy), 'Sanitized Vy must be 0');
assert(cleaned.angle === 0 && Number.isFinite(cleaned.angle), 'Sanitized angle must be 0');
console.log('✓ Coordinate sanitization defense passed.');

// Test 4: Headless Smoke Test via Electron
console.log('[Test 4] Running Electron smoke test with TEST_MODE=true...');
const electronPath = require('electron');
const appDir = path.resolve(__dirname, '..');

const child = spawn(electronPath, ['.'], {
  cwd: appDir,
  env: Object.assign({}, process.env, { TEST_MODE: 'true' }),
  stdio: 'inherit'
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('✓ Electron window lifecycle smoke test passed cleanly (exit code 0).');
    console.log('=== All Zero-G Notes Integrity Tests Succeeded ===');
    process.exit(0);
  } else {
    console.error(`✗ Electron smoke test failed with exit code: ${code}`);
    process.exit(code || 1);
  }
});
