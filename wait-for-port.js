const net = require('net');

const port = process.argv[2] || 4000;
const timeout = parseInt(process.argv[3]) || 120;
const interval = 2;

/**
 * We try multiple hosts in case IPv6 (::1) is preferred over IPv4 (127.0.0.1)
 * or vice‑versa. The list can be overridden via WAIT_FOR_PORT_HOSTS env var.
 */
const hostList = (process.env.WAIT_FOR_PORT_HOSTS || '127.0.0.1,::1,localhost')
  .split(',')
  .map((host) => host.trim())
  .filter(Boolean);

let elapsed = 0;

console.log(`⏳ Waiting for port ${port} to be ready (timeout: ${timeout}s)...`);
console.log(`   Hosts to probe: ${hostList.join(', ')}`);

const attemptConnection = (host, onDone) => {
  const client = new net.Socket();
  let finished = false;

  const cleanup = (cb) => {
    if (finished) return;
    finished = true;
    client.destroy();
    cb();
  };

  client.setTimeout(1000);

  client.once('connect', () =>
    cleanup(() => {
      console.log(`✅ Port ${port} is ready via ${host}`);
      process.exit(0);
    }),
  );

  const handleFailure = (reason) => () =>
    cleanup(() => {
      onDone(reason);
    });

  client.once('timeout', handleFailure('timeout'));
  client.once('error', handleFailure('error'));

  try {
    client.connect(port, host);
  } catch (err) {
    cleanup(() => onDone(err.message));
  }
};

const checkPort = () => {
  let pendingHosts = hostList.length;
  let retryScheduled = false;

  hostList.forEach((host) => {
    attemptConnection(host, () => {
      pendingHosts -= 1;
      if (pendingHosts === 0 && !retryScheduled) {
        retryScheduled = true;
        retry();
      }
    });
  });
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
