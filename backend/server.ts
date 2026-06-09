import http from 'http';
import app from './src/app';
import { connectDB } from './src/config/db';
import { env } from './src/config/env';
import { initializeSocket } from './src/socket';
import { startCronJobs } from './src/jobs/trendingJob';

const server = http.createServer(app);

const PORT = env.PORT || 5000;

// Initialize Socket.io
initializeSocket(server);

connectDB().then(() => {
  // Start Background Cron Jobs
  startCronJobs();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
  });
}).catch(err => {
  console.error('Database connection failed', err);
  process.exit(1);
});
