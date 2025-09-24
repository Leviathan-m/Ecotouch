import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';
import { logger } from '../utils/logger';

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface TelegramAuthData {
  query_id?: string;
  user?: TelegramUser;
  auth_date: number;
  hash: string;
}

declare global {
  namespace Express {
    interface Request {
      telegramUser?: TelegramUser;
      user?: User;
    }
  }
}

export const telegramAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header',
      });
    }

    const initData = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!initData) {
      return res.status(401).json({
        success: false,
        error: 'Missing Telegram init data',
      });
    }

    // Parse init data
    const params = new URLSearchParams(initData);
    const authData: any = {};

    for (const [key, value] of params.entries()) {
      try {
        authData[key] = JSON.parse(value);
      } catch {
        authData[key] = value;
      }
    }

    // Validate required fields
    if (!authData.user || !authData.auth_date || !authData.hash) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Telegram auth data',
      });
    }

    // Check auth date (within 24 hours)
    const authTimestamp = authData.auth_date;
    const now = Math.floor(Date.now() / 1000);
    const timeDiff = now - authTimestamp;

    if (timeDiff > 86400) { // 24 hours
      return res.status(401).json({
        success: false,
        error: 'Telegram auth data expired',
      });
    }

    // Verify hash
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      logger.error('TELEGRAM_BOT_TOKEN not configured');
      return res.status(500).json({
        success: false,
        error: 'Server configuration error',
      });
    }

    const secretKey = crypto.createHash('sha256').update(botToken).digest();
    const dataCheckString = Object.keys(authData)
      .filter(key => key !== 'hash')
      .sort()
      .map(key => `${key}=${typeof authData[key] === 'object' ? JSON.stringify(authData[key]) : authData[key]}`)
      .join('\n');

    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(dataCheckString);
    const calculatedHash = hmac.digest('hex');

    if (calculatedHash !== authData.hash) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Telegram auth hash',
      });
    }

    // Auth successful, get or create user
    const telegramUser = authData.user;
    req.telegramUser = telegramUser;

    let user = await User.findOne({ where: { telegramId: telegramUser.id } });

    if (!user) {
      // Create new user
      user = new User();
      user.telegramId = telegramUser.id;
      user.username = telegramUser.username;
      user.firstName = telegramUser.first_name;
      user.lastName = telegramUser.last_name;
      user.languageCode = telegramUser.language_code;
      await user.save();

      logger.info(`New user created: ${telegramUser.id} (${telegramUser.first_name})`);
    }

    req.user = user;
    next();

  } catch (error) {
    logger.error('Telegram auth error:', error);
    return res.status(401).json({
      success: false,
      error: 'Telegram authentication failed',
    });
  }
};
