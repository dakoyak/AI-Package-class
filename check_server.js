const http = require('http');
const fs = require('fs');

console.log('Checking server...');

const req = http.get('http://localhost:5001/health', (res) => {
  console.log(`Status: ${res.statusCode}`);
  fs.writeFileSync('server_status.txt', `Backend Status: ${res.statusCode}`);
});

req.on('error', (e) => {
  console.error(`Error: ${e.message}`);
  fs.writeFileSync('server_status.txt', `Backend Error: ${e.message}`);
});
