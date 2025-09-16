// Helper function to convert ms to "X D Y H"
exports.msToTime = (ms) => {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${days}D ${hours}H`;
}
