import { storeRepository } from '../repositories/storeRepository.js';

export async function getPublicProducts(_req, res, next) {
  try {
    const products = await storeRepository.getAllProducts({ includeHidden: false });
    return res.json(products);
  } catch (err) {
    next(err);
  }
}

export async function getAdminProducts(_req, res, next) {
  try {
    const products = await storeRepository.getAllProducts({ includeHidden: true });
    return res.json(products);
  } catch (err) {
    next(err);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await storeRepository.getProductById(req.params.id, { includeHidden: false });
    if (!product) {
      return res.status(404).json({ message: 'Parfum introuvable.' });
    }
    return res.json(product);
  } catch (err) {
    next(err);
  }
}

export async function createProduct(req, res, next) {
  try {
    const body = req.body || {};
    if (!body.name || !String(body.name).trim()) {
      return res.status(400).json({ message: 'Le nom du parfum est obligatoire.' });
    }

    const numericPrice = Number(body.price);
    if (body.price === undefined || Number.isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({
        message:
          'Veuillez saisir un prix de vente valide en Dinars Tunisiens (contrôle exclusif propriétaire).',
      });
    }

    const created = await storeRepository.createProduct({
      ...body,
      price: numericPrice,
    });

    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const updates = { ...(req.body || {}) };
    if (updates.price !== undefined) {
      const numericPrice = Number(updates.price);
      if (Number.isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ message: 'Prix invalide en Dinars Tunisiens.' });
      }
      updates.price = numericPrice;
    }

    const updated = await storeRepository.updateProduct(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ message: 'Parfum introuvable.' });
    }
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function toggleVisibility(req, res, next) {
  try {
    const existing = await storeRepository.getProductById(req.params.id, { includeHidden: true });
    if (!existing) {
      return res.status(404).json({ message: 'Parfum introuvable.' });
    }
    const updated = await storeRepository.updateProduct(req.params.id, {
      visible: existing.visible === false,
    });
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const ok = await storeRepository.deleteProduct(req.params.id);
    if (!ok) {
      return res.status(404).json({ message: 'Parfum introuvable.' });
    }
    return res.json({ success: true, id: req.params.id });
  } catch (err) {
    next(err);
  }
}
