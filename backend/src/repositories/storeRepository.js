import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { isMongoConnected } from '../config/db.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Setting from '../models/Setting.js';
import Admin from '../models/Admin.js';
import { SEED_ORDERS, SEED_PRODUCTS, SEED_SETTINGS } from '../data/seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

function ensureFileStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initialPass = process.env.ADMIN_INITIAL_PASSWORD || 'joshua2026';
    const passwordHash = bcrypt.hashSync(initialPass, 10);
    const initialDb = {
      admin: {
        username: 'proprietaire',
        passwordHash,
        updatedAt: new Date().toISOString(),
      },
      settings: { ...SEED_SETTINGS },
      products: SEED_PRODUCTS.map((p) => ({ ...p })),
      orders: SEED_ORDERS.map((o) => ({ ...o })),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  }
}

function readJsonDb() {
  ensureFileStore();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeJsonDb(data) {
  ensureFileStore();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Seeds MongoDB collections if empty when connected to MongoDB
 */
export async function initializeSeedData() {
  if (isMongoConnected()) {
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const initialPass = process.env.ADMIN_INITIAL_PASSWORD || 'joshua2026';
      const passwordHash = await bcrypt.hash(initialPass, 10);
      await Admin.create({ username: 'proprietaire', passwordHash });
    }

    const settingDoc = await Setting.findOne({ key: 'boutique_settings' });
    if (!settingDoc) {
      await Setting.create(SEED_SETTINGS);
    }

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      await Product.insertMany(
        SEED_PRODUCTS.map((p) => ({
          ...p,
          slugId: p.id,
        }))
      );
    }

    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.insertMany(SEED_ORDERS);
    }
    return;
  }

  // Ensure file store exists and is seeded
  ensureFileStore();
}

export const storeRepository = {
  // ---------------- AUTH ----------------
  async getAdminPasswordHash() {
    if (isMongoConnected()) {
      const admin = await Admin.findOne({ username: 'proprietaire' });
      return admin?.passwordHash || null;
    }
    const db = readJsonDb();
    return db.admin?.passwordHash || null;
  },

  async updateAdminPasswordHash(newHash) {
    if (isMongoConnected()) {
      await Admin.findOneAndUpdate(
        { username: 'proprietaire' },
        { passwordHash: newHash },
        { upsert: true, new: true }
      );
      return true;
    }
    const db = readJsonDb();
    db.admin = {
      username: 'proprietaire',
      passwordHash: newHash,
      updatedAt: new Date().toISOString(),
    };
    writeJsonDb(db);
    return true;
  },

  // ---------------- SETTINGS ----------------
  async getSettings() {
    if (isMongoConnected()) {
      let doc = await Setting.findOne({ key: 'boutique_settings' });
      if (!doc) doc = await Setting.create(SEED_SETTINGS);
      return doc.toJSON();
    }
    const db = readJsonDb();
    return db.settings || SEED_SETTINGS;
  },

  async updateSettings(payload) {
    if (isMongoConnected()) {
      const updated = await Setting.findOneAndUpdate(
        { key: 'boutique_settings' },
        { ...payload, key: 'boutique_settings' },
        { upsert: true, new: true }
      );
      return updated.toJSON();
    }
    const db = readJsonDb();
    db.settings = {
      ...db.settings,
      ...payload,
      key: 'boutique_settings',
    };
    writeJsonDb(db);
    return db.settings;
  },

  // ---------------- PRODUCTS ----------------
  async getAllProducts({ includeHidden = false } = {}) {
    if (isMongoConnected()) {
      const filter = includeHidden ? {} : { visible: { $ne: false } };
      const docs = await Product.find(filter).sort({ createdAt: -1 });
      return docs.map((d) => d.toJSON());
    }
    const db = readJsonDb();
    const list = db.products || [];
    const filtered = includeHidden ? list : list.filter((p) => p.visible !== false);
    return [...filtered].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  },

  async getProductById(id, { includeHidden = false } = {}) {
    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id)
        ? { $or: [{ _id: id }, { slugId: id }] }
        : { slugId: id };
      const doc = await Product.findOne(query);
      if (!doc) return null;
      const json = doc.toJSON();
      if (!includeHidden && json.visible === false) return null;
      return json;
    }
    const db = readJsonDb();
    const found = (db.products || []).find((p) => p.id === id);
    if (!found) return null;
    if (!includeHidden && found.visible === false) return null;
    return found;
  },

  async createProduct(productData) {
    const cleanStock = Math.max(0, Number(productData.stock) || 0);
    const cleanAvail = cleanStock <= 0 ? false : Boolean(productData.available);
    const slugId = `prod-${Date.now()}`;

    if (isMongoConnected()) {
      const created = await Product.create({
        slugId,
        name: productData.name.trim(),
        subtitle: productData.subtitle?.trim() || 'Eau de Parfum',
        category: productData.category || 'Mixte',
        volume: productData.volume?.trim() || '100 ml',
        price: Number(productData.price),
        available: cleanAvail,
        stock: cleanStock,
        visible: productData.visible !== false,
        featured: Boolean(productData.featured),
        isNew: Boolean(productData.isNew),
        notes: productData.notes?.trim() || '',
        description: productData.description?.trim() || '',
        photos:
          Array.isArray(productData.photos) && productData.photos.length > 0
            ? productData.photos
            : ['/images/p1.jpg'],
      });
      return created.toJSON();
    }

    const db = readJsonDb();
    const newProd = {
      id: slugId,
      name: productData.name.trim(),
      subtitle: productData.subtitle?.trim() || 'Eau de Parfum',
      category: productData.category || 'Mixte',
      volume: productData.volume?.trim() || '100 ml',
      price: Number(productData.price),
      available: cleanAvail,
      stock: cleanStock,
      visible: productData.visible !== false,
      featured: Boolean(productData.featured),
      isNew: Boolean(productData.isNew),
      notes: productData.notes?.trim() || '',
      description: productData.description?.trim() || '',
      photos:
        Array.isArray(productData.photos) && productData.photos.length > 0
          ? productData.photos
          : ['/images/p1.jpg'],
      createdAt: new Date().toISOString(),
    };
    db.products = [newProd, ...(db.products || [])];
    writeJsonDb(db);
    return newProd;
  },

  async updateProduct(id, updates) {
    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id)
        ? { $or: [{ _id: id }, { slugId: id }] }
        : { slugId: id };
      const existing = await Product.findOne(query);
      if (!existing) return null;

      if (updates.name !== undefined) existing.name = String(updates.name).trim();
      if (updates.subtitle !== undefined) existing.subtitle = String(updates.subtitle).trim();
      if (updates.category !== undefined) existing.category = updates.category;
      if (updates.volume !== undefined) existing.volume = String(updates.volume).trim();
      if (updates.price !== undefined) existing.price = Number(updates.price);
      if (updates.stock !== undefined) existing.stock = Math.max(0, Number(updates.stock) || 0);
      if (updates.available !== undefined) existing.available = Boolean(updates.available);
      if (existing.stock <= 0) existing.available = false;
      if (updates.visible !== undefined) existing.visible = Boolean(updates.visible);
      if (updates.featured !== undefined) existing.featured = Boolean(updates.featured);
      if (updates.isNew !== undefined) existing.isNew = Boolean(updates.isNew);
      if (updates.notes !== undefined) existing.notes = String(updates.notes).trim();
      if (updates.description !== undefined)
        existing.description = String(updates.description).trim();
      if (Array.isArray(updates.photos) && updates.photos.length > 0) {
        existing.photos = updates.photos;
      }

      await existing.save();
      return existing.toJSON();
    }

    const db = readJsonDb();
    let updatedItem = null;
    db.products = (db.products || []).map((p) => {
      if (p.id !== id) return p;
      const nextStock =
        updates.stock !== undefined ? Math.max(0, Number(updates.stock) || 0) : p.stock;
      const nextAvail =
        updates.available !== undefined ? Boolean(updates.available) : p.available;
      updatedItem = {
        ...p,
        ...updates,
        price: updates.price !== undefined ? Number(updates.price) : p.price,
        stock: nextStock,
        available: nextStock <= 0 ? false : nextAvail,
      };
      return updatedItem;
    });
    if (!updatedItem) return null;
    writeJsonDb(db);
    return updatedItem;
  },

  async deleteProduct(id) {
    if (isMongoConnected()) {
      const query = mongoose.Types.ObjectId.isValid(id)
        ? { $or: [{ _id: id }, { slugId: id }] }
        : { slugId: id };
      const deleted = await Product.findOneAndDelete(query);
      return Boolean(deleted);
    }
    const db = readJsonDb();
    const before = (db.products || []).length;
    db.products = (db.products || []).filter((p) => p.id !== id);
    writeJsonDb(db);
    return db.products.length < before;
  },

  // ---------------- ORDERS ----------------
  async getAllOrders() {
    if (isMongoConnected()) {
      const docs = await Order.find({}).sort({ createdAt: -1 });
      return docs.map((d) => d.toJSON());
    }
    const db = readJsonDb();
    return [...(db.orders || [])].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  },

  async getOrderByReference(reference) {
    if (isMongoConnected()) {
      const doc = await Order.findOne({ reference });
      return doc ? doc.toJSON() : null;
    }
    const db = readJsonDb();
    return (db.orders || []).find((o) => o.reference === reference) || null;
  },

  async createOrder(orderData) {
    if (isMongoConnected()) {
      const created = await Order.create(orderData);
      // Decrement product stocks in MongoDB
      for (const item of orderData.items) {
        const query = mongoose.Types.ObjectId.isValid(item.productId)
          ? { $or: [{ _id: item.productId }, { slugId: item.productId }] }
          : { slugId: item.productId };
        const prod = await Product.findOne(query);
        if (prod) {
          prod.stock = Math.max(0, (Number(prod.stock) || 0) - (Number(item.quantity) || 1));
          if (prod.stock <= 0) prod.available = false;
          await prod.save();
        }
      }
      return created.toJSON();
    }

    const db = readJsonDb();
    const newOrder = {
      id: `ord-${Date.now()}`,
      createdAt: new Date().toISOString(),
      ...orderData,
    };
    db.orders = [newOrder, ...(db.orders || [])];

    // Decrement product stocks in JSON DB
    db.products = (db.products || []).map((prod) => {
      const ordered = orderData.items.find((i) => i.productId === prod.id);
      if (!ordered) return prod;
      const nextStock = Math.max(0, (Number(prod.stock) || 0) - (Number(ordered.quantity) || 1));
      return {
        ...prod,
        stock: nextStock,
        available: nextStock > 0 ? prod.available : false,
      };
    });

    writeJsonDb(db);
    return newOrder;
  },

  async updateOrderStatus(id, status) {
    if (isMongoConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) return null;
      const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
      return updated ? updated.toJSON() : null;
    }
    const db = readJsonDb();
    let target = null;
    db.orders = (db.orders || []).map((o) => {
      if (o.id !== id) return o;
      target = { ...o, status };
      return target;
    });
    if (!target) return null;
    writeJsonDb(db);
    return target;
  },

  async deleteOrder(id) {
    if (isMongoConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) return false;
      const deleted = await Order.findByIdAndDelete(id);
      return Boolean(deleted);
    }
    const db = readJsonDb();
    const before = (db.orders || []).length;
    db.orders = (db.orders || []).filter((o) => o.id !== id);
    writeJsonDb(db);
    return db.orders.length < before;
  },
};
