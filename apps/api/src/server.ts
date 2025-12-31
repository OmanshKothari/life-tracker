import app from './app';
import { env } from './config/env';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`🚀 Life Tracker API Server`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Port:        ${PORT}`);
  console.log(`   URL:         http://localhost:${PORT}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('');
  console.log('📍 Available endpoints:');
  console.log(`   GET\t\thttp://localhost:${PORT}/api/v1/profile`);
  console.log(`   PATCH\thttp://localhost:${PORT}/api/v1/profile`);
  console.log(`   GET\t\thttp://localhost:${PORT}/api/v1/profile/stats`);
  console.log(`   GET\t\thttp://localhost:${PORT}/api/v1/profile/level-progress`);
  console.log(`   GET\t\thttp://localhost:${PORT}/api/v1/goals`);
  console.log(`   POST\t\thttp://localhost:${PORT}/api/v1/goals`);
  console.log(`   GET\t\thttp://localhost:${PORT}/api/v1/goals/:id`);
  console.log(`   PATCH\thttp://localhost:${PORT}/api/v1/goals/:id`);
  console.log(`   PATCH\thttp://localhost:${PORT}/api/v1/goals/:id/progress`);
  console.log(`   PATCH\thttp://localhost:${PORT}/api/v1/goals/:id/complete`);
  console.log(`   DELETE\thttp://localhost:${PORT}/api/v1/goals/:id`);
  console.log(`   POST\t\thttp://localhost:${PORT}/api/v1/goals/:id/restore`);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
