const app = require('./app');
const mongoose = require('mongoose');
require('dotenv').config();

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const MAX_PORT_TRIES = 5; // try up to DEFAULT_PORT + 4

const http = require('http');

function startServer(port, remainingTries) {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);

    const onListening = () => {
      server.removeListener('error', onError);
      console.log(`Server running on port ${port}`);

      // Graceful shutdown
      const shutdown = () => {
        console.log('Shutdown signal received: closing HTTP server');
        // server.close uses callback-style API; wrap in Promise
        new Promise((res, rej) => {
          try {
            server.close((err) => (err ? rej(err) : res()));
          } catch (err) {
            rej(err);
          }
        })
          .then(() => {
            console.log('HTTP server closed');
            return mongoose.connection.close(false);
          })
          .then(() => {
            console.log('MongoDB connection closed');
            process.exit(0);
          })
          .catch((err) => {
            console.error('Error during shutdown:', err);
            process.exit(1);
          });
      };

      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);

      resolve(server);
    };

    const onError = (err) => {
      server.removeListener('listening', onListening);
      if (err && err.code === 'EADDRINUSE' && remainingTries > 0) {
        console.warn(`Port ${port} in use, trying port ${port + 1}...`);
        // close server and try next port
        server.close(() => {
          startServer(port + 1, remainingTries - 1).then(resolve).catch(reject);
        });
        return;
      }
      reject(err);
    };

    server.once('listening', onListening);
    server.once('error', onError);
    server.listen(port);
  });
}

// Connect to MongoDB then start server (with retry on port conflicts)
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB connected');
    try {
      await startServer(DEFAULT_PORT, MAX_PORT_TRIES - 1);
    } catch (err) {
      console.error('Could not start server after retries:', err);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('DB Connection Error:', err);
    process.exit(1);
  });

module.exports = app;