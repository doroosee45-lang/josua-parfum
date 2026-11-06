import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storeRepository } from '../repositories/storeRepository.js';

export async function loginAdmin(req, res, next) {
  try {
    const { password } = req.body || {};
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'Veuillez saisir votre mot de passe.' });
    }

    const storedHash = await storeRepository.getAdminPasswordHash();
    if (!storedHash) {
      return res.status(500).json({ message: 'Compte administrateur non initialisé.' });
    }

    const isValid = await bcrypt.compare(password, storedHash);
    if (!isValid) {
      return res.status(401).json({ message: 'Mot de passe incorrect. Veuillez réessayer.' });
    }

    const secret = process.env.JWT_SECRET || 'joshua_parfum_atelier_jendouba_jwt_secret_2026';
    const token = jwt.sign(
      { role: 'admin', username: 'proprietaire' },
      secret,
      { expiresIn: '7d' }
    );

    return res.json({
      authenticated: true,
      token,
      message: 'Connexion réussie à l’Espace Vendeur JOSHUA PARFUM.',
    });
  } catch (err) {
    next(err);
  }
}

export async function verifySession(req, res) {
  return res.json({
    authenticated: true,
    admin: req.admin,
  });
}

export async function changeAdminPassword(req, res, next) {
  try {
    const { newPassword } = req.body || {};
    if (!newPassword || String(newPassword).trim().length < 4) {
      return res.status(400).json({
        message: 'Le nouveau mot de passe doit contenir au moins 4 caractères.',
      });
    }

    const passwordHash = await bcrypt.hash(String(newPassword).trim(), 10);
    await storeRepository.updateAdminPasswordHash(passwordHash);

    return res.json({
      success: true,
      message: 'Mot de passe propriétaire mis à jour avec succès.',
    });
  } catch (err) {
    next(err);
  }
}
