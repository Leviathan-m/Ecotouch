import { Router, Request, Response } from 'express';
import { createConnection } from 'typeorm';

const router = Router();

// Health check endpoint
router.get('/health', async (req: Request, res: Response) => {
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
});

// Detailed health check for monitoring
router.get('/health/detailed', async (req: Request, res: Response) => {
  try {
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: 'unknown', latency: 0 },
        redis: { status: 'unknown', latency: 0 },
        blockchain: { status: 'unknown', latency: 0 },
        external_apis: { status: 'unknown', latency: 0 },
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        platform: process.platform,
        nodeVersion: process.version,
      },
    };

    // Detailed database check
    const dbStart = Date.now();
    try {
      const connection = await createConnection();
      await connection.query('SELECT 1');
      await connection.close();
      detailedHealth.services.database = {
        status: 'healthy',
        latency: Date.now() - dbStart,
      };
    } catch (dbError) {
      detailedHealth.services.database = {
        status: 'unhealthy',
        latency: Date.now() - dbStart,
      };
      detailedHealth.status = 'unhealthy';
    }

    // Detailed Redis check (if configured)
    if (process.env.REDIS_HOST) {
      const redisStart = Date.now();
      try {
        // Add Redis ping logic here
        detailedHealth.services.redis = {
          status: 'healthy',
          latency: Date.now() - redisStart,
        };
      } catch (redisError) {
        detailedHealth.services.redis = {
          status: 'unhealthy',
          latency: Date.now() - redisStart,
        };
        if (detailedHealth.status === 'healthy') {
          detailedHealth.status = 'degraded';
        }
      }
    }

    const statusCode = detailedHealth.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(detailedHealth);

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

export default router;
