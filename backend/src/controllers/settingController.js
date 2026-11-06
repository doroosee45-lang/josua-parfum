import { storeRepository } from '../repositories/storeRepository.js';

export async function getSettings(_req, res, next) {
  try {
    const settings = await storeRepository.getSettings();
    return res.json(settings);
  } catch (err) {
    next(err);
  }
}

export async function updateSettings(req, res, next) {
  try {
    const updated = await storeRepository.updateSettings(req.body || {});
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function exportFullBackup(_req, res, next) {
  try {
    const [products, orders, settings] = await Promise.all([
      storeRepository.getAllProducts({ includeHidden: true }),
      storeRepository.getAllOrders(),
      storeRepository.getSettings(),
    ]);
    return res.json({
      exportedAt: new Date().toISOString(),
      boutique: settings.boutiqueName || 'JOSHUA PARFUM',
      products,
      orders,
      settings,
    });
  } catch (err) {
    next(err);
  }
}
