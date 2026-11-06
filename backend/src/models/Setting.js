import mongoose from 'mongoose';

const deliveryZoneSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    fee: { type: Number, required: true, min: 0 },
    delay: { type: String, default: '24h à 48h' },
  },
  { _id: false }
);

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'boutique_settings', unique: true },
    boutiqueName: { type: String, default: 'JOSHUA PARFUM' },
    slogan: { type: String, default: 'Votre parfum, votre élégance.' },
    whatsappNumber: { type: String, default: '+216 56 45 49 46' },
    deliveryZoneSummary: { type: String, default: 'Jendouba et communes voisines, Tunisie' },
    freeDeliveryEnabled: { type: Boolean, default: true },
    freeDeliveryThreshold: { type: Number, default: 280 },
    enableBankTransfer: { type: Boolean, default: false },
    bankDetails: { type: String, default: '' },
    paymentConditions: { type: String, default: '' },
    returnPolicy: { type: String, default: '' },
    deliveryZones: { type: [deliveryZoneSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

settingSchema.set('toJSON', {
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret._id;
    return ret;
  },
});

export default mongoose.models.Setting || mongoose.model('Setting', settingSchema);
