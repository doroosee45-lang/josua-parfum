import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: 'Mixte' },
    volume: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    photo: { type: String, default: '/images/p1.jpg' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['Nouvelle', 'Confirmée', 'En préparation', 'En livraison', 'Livrée', 'Annulée'],
      default: 'Nouvelle',
      index: true,
    },
    paymentMethod: {
      type: String,
      default: 'Espèces à la livraison',
    },
    channel: {
      type: String,
      default: 'Boutique & WhatsApp',
    },
    customer: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      cityId: { type: String, required: true },
      cityName: { type: String, required: true },
      neighborhood: { type: String, default: '' },
      address: { type: String, required: true, trim: true },
      instructions: { type: String, default: '' },
    },
    items: {
      type: [orderItemSchema],
      required: true,
    },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  {
    timestamps: true,
  }
);

orderSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    return ret;
  },
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);
