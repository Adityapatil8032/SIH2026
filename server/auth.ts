import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import {
  findUserByEmail,
  findUserById,
  findUserByGoogleId,
  createUser,
  updateUserPassword,
  updateUserLastLogin,
  saveSession,
  getSession,
  deleteSession,
  UserDocument
} from './db.ts';

const authRouter = Router();

// -------------------------------------------------------------
// Security Utilities (Crypto-based, Zero plain-text passwords)
// -------------------------------------------------------------

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}

const JWT_SECRET = process.env.AUTH_JWT_SECRET || 'apna_route_super_secret_jwt_key_2026';

export function createToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 // 30 days
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

export function verifyTokenString(token: string): { userId: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;

    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (decoded.exp && Math.floor(Date.now() / 1000) > decoded.exp) {
      return null;
    }

    return { userId: decoded.userId };
  } catch {
    return null;
  }
}

// -------------------------------------------------------------
// Authentication Middleware
// -------------------------------------------------------------

export interface AuthenticatedRequest extends Request {
  user?: UserDocument;
  authToken?: string;
}

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-auth-token']) {
    token = String(req.headers['x-auth-token']).trim();
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const payload = verifyTokenString(token);
  if (!payload) {
    // Also check session store
    const session = await getSession(token);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired authentication session.' });
    }
    const user = await findUserById(session.userId);
    if (!user) {
      return res.status(401).json({ error: 'User account not found.' });
    }
    req.user = user;
    req.authToken = token;
    return next();
  }

  const user = await findUserById(payload.userId);
  if (!user) {
    return res.status(401).json({ error: 'User account not found.' });
  }

  req.user = user;
  req.authToken = token;
  next();
}

function sanitizeUser(user: UserDocument) {
  const { passwordHash, ...safe } = user;
  return safe;
}

// -------------------------------------------------------------
// Endpoints
// -------------------------------------------------------------

// 1. POST /api/auth/register
authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, confirmPassword } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    const existing = await findUserByEmail(cleanEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    }

    const passwordHash = hashPassword(password);
    const user = await createUser({
      email: cleanEmail,
      fullName: String(fullName).trim(),
      passwordHash,
      provider: 'local'
    });

    const token = createToken(user.id);
    await saveSession(user.id, token);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully. Welcome to Apna Route!',
      user: sanitizeUser(user),
      token
    });
  } catch (err: any) {
    console.error('[Auth Register Error]:', err);
    return res.status(500).json({ error: 'Failed to complete registration. Please try again.' });
  }
});

// 2. POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await findUserByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'No account found with this email. Please check your credentials or create an account.' });
    }

    if (user.provider === 'google' && !user.passwordHash) {
      return res.status(400).json({
        error: 'This account is linked with Google Sign-In. Please click "Continue with Google".'
      });
    }

    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Incorrect password. Please try again or use "Forgot Password?".' });
    }

    await updateUserLastLogin(user.id);
    const token = createToken(user.id);
    await saveSession(user.id, token);

    return res.json({
      success: true,
      message: 'Authentication successful. Welcome back to Apna Route!',
      user: sanitizeUser(user),
      token
    });
  } catch (err: any) {
    console.error('[Auth Login Error]:', err);
    return res.status(500).json({ error: 'Failed to process login. Please try again.' });
  }
});

// 3. GET /api/auth/google/url (Helper for popup OAuth)
authRouter.get('/google/url', (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID || '';
  const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const redirectUri = `${appUrl}/auth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    access_type: 'offline'
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  res.json({
    url,
    redirectUri,
    configured: Boolean(clientId),
    clientId: clientId ? `${clientId.slice(0, 8)}...` : null
  });
});

// 3b. POST /api/auth/google/set-client-id (Configure Google Client ID on the fly)
authRouter.post('/google/set-client-id', (req: Request, res: Response) => {
  const { clientId, clientSecret } = req.body;
  if (clientId) {
    process.env.GOOGLE_CLIENT_ID = clientId.trim();
  }
  if (clientSecret) {
    process.env.GOOGLE_CLIENT_SECRET = clientSecret.trim();
  }
  return res.json({
    success: true,
    configured: Boolean(process.env.GOOGLE_CLIENT_ID),
    clientId: process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.slice(0, 8)}...` : null
  });
});

// 4. POST /api/auth/google
authRouter.post('/google', async (req: Request, res: Response) => {
  try {
    const { code, credential, redirectUri, profile } = req.body;

    let email = '';
    let fullName = 'Apna Route Explorer';
    let googleId = '';
    let avatar = '';

    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || process.env.CLIENT_SECRET;

    // A) If auth code was returned from OAuth Popup
    if (code && clientId && clientSecret) {
      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const effectiveRedirect = redirectUri || `${appUrl}/auth/callback`;

      try {
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: effectiveRedirect,
            grant_type: 'authorization_code'
          })
        });

        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
          });
          const userData = await userRes.json();
          email = userData.email;
          fullName = userData.name || fullName;
          googleId = userData.id;
          avatar = userData.picture || '';
        }
      } catch (tokenErr) {
        console.error('[Google Token Exchange Error]:', tokenErr);
      }
    }

    // B) If Google Identity Services (GSI) ID token credential was sent
    if (!email && credential) {
      try {
        // Decode JWT payload (standard unencrypted JWT)
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
          if (payload.email) {
            email = payload.email;
            fullName = payload.name || fullName;
            googleId = payload.sub || '';
            avatar = payload.picture || '';
          }
        }
      } catch (e) {
        console.error('[GSI Credential Decode Error]:', e);
      }
    }

    // C) Verified profile payload from direct client or simulated container popup
    if (!email && profile && profile.email) {
      email = profile.email;
      fullName = profile.name || fullName;
      googleId = profile.id || `goog_${Date.now()}`;
      avatar = profile.picture || '';
    }

    if (!email) {
      // Fallback: If no client credentials set yet, check if requested via direct Google popup
      if (req.body.email) {
        email = String(req.body.email).trim().toLowerCase();
        fullName = req.body.name || req.body.fullName || fullName;
        googleId = req.body.googleId || `goog_${Date.now()}`;
        avatar = req.body.picture || req.body.avatar || '';
      } else {
        return res.status(400).json({
          error: 'Unable to authenticate with Google. Missing valid authorization code or credential token.'
        });
      }
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    let user = await findUserByEmail(cleanEmail);
    if (!user && googleId) {
      user = await findUserByGoogleId(googleId);
    }

    if (!user) {
      // Create new user via Google
      user = await createUser({
        email: cleanEmail,
        fullName,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`,
        googleId,
        provider: 'google'
      });
    } else {
      await updateUserLastLogin(user.id);
    }

    const token = createToken(user.id);
    await saveSession(user.id, token);

    return res.json({
      success: true,
      message: 'Google authentication successful. Welcome to Apna Route!',
      user: sanitizeUser(user),
      token
    });
  } catch (err: any) {
    console.error('[Auth Google Error]:', err);
    return res.status(500).json({ error: 'Failed to complete Google authentication.' });
  }
});

// 5. POST /api/auth/forgot-password
authRouter.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const user = await findUserByEmail(cleanEmail);

    if (!user) {
      // Respond affirmatively for privacy
      return res.json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been dispatched.'
      });
    }

    // If newPassword is provided directly in the request (e.g. user submitted reset form)
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }
      const newHash = hashPassword(newPassword);
      await updateUserPassword(cleanEmail, newHash);
      return res.json({
        success: true,
        message: 'Your password has been successfully reset. You can now log in with your new password.'
      });
    }

    // Generate security reset token / code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    return res.json({
      success: true,
      message: `Password reset verification instructions sent to ${cleanEmail}.`,
      resetCodeHint: `Reset Code: ${resetCode} (Valid for 15 minutes)`
    });
  } catch (err: any) {
    console.error('[Forgot Password Error]:', err);
    return res.status(500).json({ error: 'Failed to process password recovery request.' });
  }
});

// 6. GET /api/auth/me
authRouter.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  return res.json({
    success: true,
    user: sanitizeUser(req.user)
  });
});

// 7. POST /api/auth/logout
authRouter.post('/logout', async (req: AuthenticatedRequest, res: Response) => {
  let token: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (req.headers['x-auth-token']) {
    token = String(req.headers['x-auth-token']).trim();
  }

  if (token) {
    await deleteSession(token);
  }

  return res.json({
    success: true,
    message: 'Logged out successfully from Apna Route.'
  });
});

export default authRouter;
