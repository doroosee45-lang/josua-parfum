import mongoose from 'mongoose';

let mongoConnected = false;

export function isMongoConnected() {
  return mongoConnected && mongoose.connection.readyState === 1;
}

export async function connectDatabase() {
  const uri = (process.env.MONGO_URI || '').trim();

  if (!uri) {
    console.log(
      'ℹ️  [DB] MONGO_URI non défini — Activation de la base persistante serveur (backend/data/database.json).'
    );
    mongoConnected = false;
    return { engine: 'persistent-json' };
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 4000,
    });
    mongoConnected = true;
    console.log(`✅ [DB] Connecté avec succès à MongoDB (${mongoose.connection.name})`);
    return { engine: 'mongodb' };
  } catch (err) {
    console.warn(
      `⚠️  [DB] MongoDB inaccessible (${err.message}) — Bascule automatique sur la base persistante serveur (backend/data/database.json).`
    );
    mongoConnected = false;
    return { engine: 'persistent-json' };
  }
}
