/**
 * WhatsApp & Social Sharing Utilities for JOSHUA PARFUM
 * Official WhatsApp: +216 56 45 49 46
 */

export function sanitizePhoneForWhatsApp(rawPhone = '+216 56 45 49 46') {
  let digits = String(rawPhone).replace(/[^\d]/g, '');
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }
  // If 8-digit local Tunisian number, prepend 216
  if (digits.length === 8) {
    digits = `216${digits}`;
  }
  return digits || '21656454946';
}

export function formatPriceDT(amount) {
  const num = Number(amount) || 0;
  return Number.isInteger(num) ? `${num} DT` : `${num.toFixed(2).replace('.', ',')} DT`;
}

export function generateOrderReference() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `JP-${yy}${mm}-${random}`;
}

/**
 * Builds the detailed WhatsApp order message sent by the customer to JOSHUA PARFUM (+216 56 45 49 46)
 */
export function buildOrderWhatsAppMessage(order, boutiqueName = 'JOSHUA PARFUM') {
  const lines = [
    `✨ *NOUVELLE COMMANDE — ${boutiqueName}* ✨`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `📌 *Référence :* ${order.reference}`,
    `💳 *Paiement :* ${order.paymentMethod || 'Espèces à la livraison'}`,
    ``,
    `👤 *COORDONNÉES CLIENT*`,
    `• Nom : ${order.customer.fullName}`,
    `• Téléphone : ${order.customer.phone}`,
    `• Ville : ${order.customer.cityName}${order.customer.neighborhood ? ` (${order.customer.neighborhood})` : ''}`,
    `• Adresse : ${order.customer.address}`,
  ];

  if (order.customer.instructions) {
    lines.push(`• Instructions : ${order.customer.instructions}`);
  }

  lines.push(``, `🌸 *ARTICLES COMMANDÉS*`);
  order.items.forEach((item) => {
    const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
    lines.push(
      `▫️ ${item.quantity}x *${item.name}* (${item.category}${item.volume ? ` · ${item.volume}` : ''}) — ${formatPriceDT(lineTotal)}`
    );
  });

  lines.push(
    ``,
    `🧾 *RÉCAPITULATIF*`,
    `• Sous-total : ${formatPriceDT(order.subtotal)}`,
    `• Livraison (${order.customer.cityName}) : ${order.deliveryFee === 0 ? 'Gratuite (0 DT)' : formatPriceDT(order.deliveryFee)}`,
    `• *TOTAL À PAYER À LA LIVRAISON : ${formatPriceDT(order.total)}*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    `Merci de confirmer ma commande 🙏`
  );

  return lines.join('\n');
}

export function buildOrderWhatsAppUrl(order, whatsappNumber = '+216 56 45 49 46', boutiqueName = 'JOSHUA PARFUM') {
  const phone = sanitizePhoneForWhatsApp(whatsappNumber);
  const text = buildOrderWhatsAppMessage(order, boutiqueName);
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Quick 1-product direct WhatsApp inquiry/order URL
 */
export function buildQuickProductWhatsAppUrl(product, quantity = 1, whatsappNumber = '+216 56 45 49 46') {
  const phone = sanitizePhoneForWhatsApp(whatsappNumber);
  const total = (Number(product.price) || 0) * quantity;
  const text = [
    `Bonjour *JOSHUA PARFUM* ✨`,
    ``,
    `Je souhaite commander en paiement espèces à la livraison :`,
    `🌸 *${product.name}* (${product.category}${product.volume ? ` · ${product.volume}` : ''})`,
    `• Quantité : ${quantity}`,
    `• Prix unitaire : ${formatPriceDT(product.price)}`,
    `• Sous-total : *${formatPriceDT(total)}* (hors livraison)`,
    ``,
    `Pouvez-vous me confirmer la disponibilité pour ma livraison ?`,
  ].join('\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Builds WhatsApp message from Owner/Admin to Customer to update them on their order
 */
export function buildAdminToClientWhatsAppUrl(order) {
  const clientPhone = sanitizePhoneForWhatsApp(order.customer.phone);
  const statusMessages = {
    Nouvelle: `nous avons bien reçu votre commande *${order.reference}* d’un total de *${formatPriceDT(order.total)}* (${order.paymentMethod}). Nous la vérifions immédiatement.`,
    Confirmée: `votre commande *${order.reference}* (*${formatPriceDT(order.total)}* — ${order.paymentMethod}) est *confirmée* ! Nous préparons vos parfums avec soin.`,
    'En préparation': `votre commande *${order.reference}* est actuellement *en préparation* dans notre atelier JOSHUA PARFUM.`,
    'En livraison': `bonne nouvelle ! Votre commande *${order.reference}* (*${formatPriceDT(order.total)}* à régler à la livraison) est *en cours de livraison* vers ${order.customer.cityName}.`,
    Livrée: `merci infiniment pour votre confiance ! Nous espérons que votre parfum vous apportera entière satisfaction. *Votre parfum, votre élégance.* ✨`,
    Annulée: `concernant votre commande *${order.reference}*, celle-ci a été annulée. N’hésitez pas à nous écrire si vous souhaitez la reprogrammer.`,
  };

  const body = statusMessages[order.status] || statusMessages.Confirmée;
  const text = `Bonjour ${order.customer.fullName},\n\nIci *JOSHUA PARFUM* 🌸 — ${body}\n\nÀ très bientôt !`;
  return `https://wa.me/${clientPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Social sharing URLs for WhatsApp, Facebook, and TikTok
 */
export function getSocialShareLinks(shareUrl, customTitle = 'JOSHUA PARFUM — Votre parfum, votre élégance.') {
  const url = shareUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  const message = `${customTitle}\nDécouvrez nos parfums Homme, Femme & Mixte — Livraison à Jendouba et villes voisines, paiement en espèces à la livraison : ${url}`;
  return {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(message)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(customTitle)}`,
    tiktokText: message,
    rawUrl: url,
  };
}
