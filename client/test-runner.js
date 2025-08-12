const { execSync } = require('child_process');

console.log('Running HotelDetail tests to identify failures...\n');

try {
  // Run just the HotelDetail tests
  const result = execSync('npm test -- --run HotelDetail', { 
    cwd: './client',
    encoding: 'utf8',
    stdio: 'pipe'
  });
  console.log('✅ All HotelDetail tests passed!');
} catch (error) {
  console.log('❌ Some HotelDetail tests failed:');
  console.log(error.stdout || error.message);
}
