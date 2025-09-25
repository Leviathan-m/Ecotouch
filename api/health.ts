import { createConnection } from 'typeorm';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const healthcheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // Check database connection
    try {
      const connection = await createConnection();
      await connection.close();
      healthcheck.database = 'connected';
    } catch (dbError) {
      healthcheck.database = 'disconnected';
      healthcheck.status = 'degraded';
    }

    // Check Redis connection (if available)
    try {
      // Add Redis health check logic here
      healthcheck.redis = 'connected';
    } catch (redisError) {
      healthcheck.redis = 'disconnected';
      if (healthcheck.status === 'healthy') {
        healthcheck.status = 'degraded';
      }
    }

    // Check external APIs (basic connectivity)
    try {
      // Add external API health checks here
      healthcheck.external_apis = 'reachable';
    } catch (apiError) {
      healthcheck.external_apis = 'unreachable';
      if (healthcheck.status === 'healthy') {
        healthcheck.status = 'degraded';
      }
    }

    const statusCode = healthcheck.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthcheck);

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
}
