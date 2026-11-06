import { storeRepository } from '../repositories/storeRepository.js';

const VALID_STATUSES = new Set([
  'Nouvelle',
  'Confirmée',
  'En préparation',
  'En livraison',
  'Livrée',
  'Annulée',
]);

function generateUniqueReference() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `JP-${yy}${mm}-${rand}`;
}

export async function createOrder(req, res, next) {
  try {
    const { customer, items, paymentMethod, channel } = req.body || {};

    if (!customer || !customer.fullName?.trim() || !customer.phone?.trim() || !customer.address?.trim()) {
      return res.status(400).json({
        message: 'Veuillez renseigner votre nom, téléphone et adresse complète de livraison.',
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: 'Votre commande doit contenir au moins un parfum.',
      });
    }

    // Authoritative server-side price & stock verification
    const settings = await storeRepository.getSettings();
    const verifiedItems = [];

    for (const reqItem of items) {
      const dbProd = await storeRepository.getProductById(reqItem.productId, {
        includeHidden: false,
      });
      if (!dbProd) {
        return res.status(400).json({
          message: `Le parfum demandé (${reqItem.name || reqItem.productId}) est introuvable ou n’est plus disponible.`,
        });
      }

      const qty = Math.max(1, Number(reqItem.quantity) || 1);
      if (!dbProd.available || Number(dbProd.stock) < qty) {
        return res.status(400).json({
          message: `Stock insuffisant pour « ${dbProd.name} » (${dbProd.stock} disponible(s)).`,
        });
      }

      // Price is strictly enforced from owner-defined server catalog
      const unitPrice = Number(dbProd.price);

      verifiedItems.push({
        productId: dbProd.id,
        name: dbProd.name,
        category: dbProd.category,
        volume: dbProd.volume || '',
        price: unitPrice,
        quantity: qty,
        photo: dbProd.photos?.[0] || '/images/p1.jpg',
      });
    }

    const subtotal = verifiedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    // Compute delivery fee from authoritative backend settings
    let deliveryFee = 7;
    const matchedZone = (settings.deliveryZones || []).find((z) => z.id === customer.cityId);
    if (matchedZone) {
      deliveryFee = Number(matchedZone.fee) || 0;
    }
    if (
      settings.freeDeliveryEnabled &&
      Number(settings.freeDeliveryThreshold) > 0 &&
      subtotal >= Number(settings.freeDeliveryThreshold)
    ) {
      deliveryFee = 0;
    }

    const total = subtotal + deliveryFee;

    let reference = generateUniqueReference();
    const collision = await storeRepository.getOrderByReference(reference);
    if (collision) {
      reference = generateUniqueReference();
    }

    const created = await storeRepository.createOrder({
      reference,
      status: 'Nouvelle',
      paymentMethod: paymentMethod || 'Espèces à la livraison',
      channel: channel || 'Boutique & WhatsApp',
      customer: {
        fullName: customer.fullName.trim(),
        phone: customer.phone.trim(),
        cityId: customer.cityId || matchedZone?.id || 'jendouba-centre',
        cityName: matchedZone?.name || customer.cityName || 'Jendouba',
        neighborhood: (customer.neighborhood || '').trim(),
        address: customer.address.trim(),
        instructions: (customer.instructions || '').trim(),
      },
      items: verifiedItems,
      subtotal,
      deliveryFee,
      total,
    });

    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
}

export async function getOrderByReference(req, res, next) {
  try {
    const order = await storeRepository.getOrderByReference(req.params.reference);
    if (!order) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }
    return res.json(order);
  } catch (err) {
    next(err);
  }
}

export async function getAdminOrders(req, res, next) {
  try {
    const { status, date, search } = req.query;
    let orders = await storeRepository.getAllOrders();

    if (status && status !== 'Toutes') {
      orders = orders.filter((o) => o.status === status);
    }
    if (date) {
      orders = orders.filter((o) => (o.createdAt || '').slice(0, 10) === date);
    }
    if (search && String(search).trim()) {
      const q = String(search).trim().toLowerCase();
      orders = orders.filter(
        (o) =>
          o.reference.toLowerCase().includes(q) ||
          (o.customer?.fullName || '').toLowerCase().includes(q) ||
          (o.customer?.phone || '').toLowerCase().includes(q) ||
          (o.customer?.cityName || '').toLowerCase().includes(q)
      );
    }

    return res.json(orders);
  } catch (err) {
    next(err);
  }
}

export async function updateOrderStatus(req, res, next) {
  try {
    const { status } = req.body || {};
    if (!VALID_STATUSES.has(status)) {
      return res.status(400).json({ message: 'Statut de commande non valide.' });
    }
    const updated = await storeRepository.updateOrderStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }
    return res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteOrder(req, res, next) {
  try {
    const ok = await storeRepository.deleteOrder(req.params.id);
    if (!ok) {
      return res.status(404).json({ message: 'Commande introuvable.' });
    }
    return res.json({ success: true, id: req.params.id });
  } catch (err) {
    next(err);
  }
}
