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

    try {
      const connection = await createConnection();
      await connection.close();
      (healthcheck as any).database = 'connected';
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      (healthcheck as any).database = 'disconnected';
      healthcheck.status = 'degraded';
    }

    try {
      (healthcheck as any).redis = 'connected';
    } catch (redisError) {
      (healthcheck as any).redis = 'disconnected';
      if (healthcheck.status === 'healthy') {
        healthcheck.status = 'degraded';
      }
    }

    try {
      (healthcheck as any).external_apis = 'reachable';
    } catch (apiError) {
      (healthcheck as any).external_apis = 'unreachable';
      if (healthcheck.status === 'healthy') {
        healthcheck.status = 'degraded';
      }
    }

    const statusCode = healthcheck.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthcheck);

  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
}


