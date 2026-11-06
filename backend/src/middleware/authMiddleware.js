import jwt from 'jsonwebtoken';

export function requireAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Accès réservé au propriétaire. Veuillez vous connecter à l’Espace Vendeur.',
      });
    }

    const token = authHeader.slice(7).trim();
    const secret = process.env.JWT_SECRET || 'joshua_parfum_atelier_jendouba_jwt_secret_2026';
    const decoded = jwt.verify(token, secret);

    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({
        message: 'Droits administrateur insuffisants.',
      });
    }

    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({
      message: 'Session expirée ou invalide. Veuillez vous reconnecter.',
    });
  }
}
