const net = require('net');

const port = process.argv[2] || 4000;
const timeout = parseInt(process.argv[3]) || 60;
const interval = 2;

let elapsed = 0;

console.log(`⏳ Waiting for port ${port} to be ready...`);

const checkPort = () => {
  const client = new net.Socket();
  
  client.setTimeout(1000);
  
  client.on('connect', () => {
    console.log(`✅ Port ${port} is ready!`);
    client.destroy();
    process.exit(0);
  });
  
  client.on('timeout', () => {
    client.destroy();
    retry();
  });
  
  client.on('error', () => {
    client.destroy();
    retry();
  });
  
  client.connect(port, 'localhost');
};

const retry = () => {
  elapsed += interval;
  
  if (elapsed >= timeout) {
    console.error(`❌ Port ${port} did not become ready within ${timeout}s`);
    process.exit(1);
  }
  
  console.log(`   Checking port ${port}... (${elapsed}s/${timeout}s)`);
  setTimeout(checkPort, interval * 1000);
};

checkPort();
