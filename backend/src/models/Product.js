import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    slugId: { type: String, index: true },
    name: { type: String, required: true, trim: true },
    subtitle: { type: String, default: 'Eau de Parfum', trim: true },
    category: {
      type: String,
      enum: ['Femme', 'Homme', 'Mixte'],
      default: 'Mixte',
      index: true,
    },
    volume: { type: String, default: '100 ml', trim: true },
    price: { type: Number, required: true, min: 0 },
    available: { type: Boolean, default: true },
    stock: { type: Number, default: 0, min: 0 },
    visible: { type: Boolean, default: true, index: true },
    featured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    notes: { type: String, default: '', trim: true },
    description: { type: String, default: '', trim: true },
    photos: {
      type: [String],
      default: ['/images/p1.jpg'],
    },
  },
  {
    timestamps: true,
    suppressReservedKeysWarning: true,
  }
);

productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret.slugId || String(ret._id);
    delete ret._id;
    return ret;
  },
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);
