import mongoose from "mongoose";

/**
 * ----- Mongo connection (cached) -----
 * كل شيء داخل الملف علشان ما تحتاج import خارجي.
 */
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.warn("Warning: MONGO_URI not defined in environment");
}

/**
 * Use globalThis cache to avoid multiple connections in dev / serverless
 */
if (!globalThis._mongo) globalThis._mongo = { conn: null, promise: null };
if (!globalThis._mongoModels) globalThis._mongoModels = {};

async function connectToMongo() {
  if (globalThis._mongo.conn) return globalThis._mongo.conn;
  if (!MONGO_URI) throw new Error("Please set MONGO_URI environment variable");

  if (!globalThis._mongo.promise) {
    globalThis._mongo.promise = mongoose
      .connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then((mongooseInstance) => mongooseInstance);
  }

  globalThis._mongo.conn = await globalThis._mongo.promise;
  return globalThis._mongo.conn;
}

/**
 * Loose schema to accept any document shape
 */
const schema = new mongoose.Schema({}, { strict: false });

function normalizeModelName(name) {
  return `Model_${String(name).replace(/[^a-zA-Z0-9]/g, "_")}`;
}

function getModelForCollection(collectionName) {
  const name = String(collectionName);
  if (globalThis._mongoModels[name]) return globalThis._mongoModels[name];

  const modelName = normalizeModelName(name);
  // If a model with this safe name already exists in mongoose.models, reuse it.
  const Model = mongoose.models[modelName] || mongoose.model(modelName, schema, name);
  globalThis._mongoModels[name] = Model;
  return Model;
}

async function listCollections() {
  await connectToMongo();
  const cols = await mongoose.connection.db.listCollections().toArray();
  // filter out internal/system collections
  return cols
    .map((c) => c.name)
    .filter((n) => !n.startsWith("system."));
}

/**
 * Helpers
 */
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function parseBody(request) {
  try {
    return await request.json();
  } catch (err) {
    return null;
  }
}

function getSearchParams(request) {
  const url = new URL(request.url);
  return {
    collection: url.searchParams.get("collection"),
    id: url.searchParams.get("id"),
  };
}

/**
 * GET handler
 * - /api/data                      -> returns all collections (their docs)
 * - /api/data?collection=menu      -> returns all docs in 'menu' (if exists)
 * - /api/data?collection=menu&id=x -> returns specific doc
 */
export async function GET(request) {
  try {
    await connectToMongo();
    const { collection, id } = getSearchParams(request);

    if (!collection) {
      const colNames = await listCollections();
      // fetch all docs for each collection (could be large)
      const results = await Promise.all(
        colNames.map(async (name) => {
          const Model = getModelForCollection(name);
          return Model.find({});
        })
      );

      const payload = colNames.reduce((acc, name, idx) => {
        acc[name] = results[idx];
        return acc;
      }, {});

      return jsonResponse(payload, 200);
    }

    const colName = String(collection);
    const existingCols = await listCollections();
    if (!existingCols.includes(colName)) {
      // If the collection doesn't exist, return 404 to avoid surprising empty responses.
      return jsonResponse({ error: `Collection '${colName}' not found` }, 404);
    }

    const Model = getModelForCollection(colName);

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) return jsonResponse({ error: "Invalid id format" }, 400);
      const doc = await Model.findById(id);
      if (!doc) return jsonResponse({ error: "Document not found" }, 404);
      return jsonResponse(doc, 200);
    }

    const docs = await Model.find({});
    return jsonResponse(docs, 200);
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: err.message || "Internal server error" }, 500);
  }
}

/**
 * POST handler
 * - POST /api/data?collection=menu  with JSON body (object or array)
 * Note: POST will create the collection if it doesn't exist yet.
 */
export async function POST(request) {
  try {
    await connectToMongo();
    const { collection } = getSearchParams(request);
    if (!collection) return jsonResponse({ error: "Collection is required" }, 400);

    const colName = String(collection);
    const Model = getModelForCollection(colName);

    const body = await parseBody(request);
    if (Array.isArray(body)) {
      const created = await Model.insertMany(body);
      return jsonResponse(created, 201);
    } else {
      const created = await Model.create(body);
      return jsonResponse(created, 201);
    }
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: err.message || "Internal server error" }, 500);
  }
}

/**
 * PUT handler
 * - PUT /api/data?collection=menu&id=<id> with JSON body
 */
export async function PUT(request) {
  try {
    await connectToMongo();
    const { collection, id } = getSearchParams(request);
    if (!collection) return jsonResponse({ error: "Collection is required" }, 400);
    if (!id) return jsonResponse({ error: "ID is required for PUT" }, 400);
    if (!mongoose.Types.ObjectId.isValid(id)) return jsonResponse({ error: "Invalid id format" }, 400);

    const colName = String(collection);
    const existingCols = await listCollections();
    if (!existingCols.includes(colName)) return jsonResponse({ error: "Collection not found" }, 404);

    const Model = getModelForCollection(colName);

    const body = await parseBody(request);
    const updated = await Model.findByIdAndUpdate(id, body, { new: true, runValidators: false });
    if (!updated) return jsonResponse({ error: "Document not found" }, 404);
    return jsonResponse(updated, 200);
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: err.message || "Internal server error" }, 500);
  }
}

/**
 * DELETE handler
 * - DELETE /api/data?collection=menu&id=<id>
 */
export async function DELETE(request) {
  try {
    await connectToMongo();
    const { collection, id } = getSearchParams(request);
    if (!collection) return jsonResponse({ error: "Collection is required" }, 400);
    if (!id) return jsonResponse({ error: "ID is required for DELETE" }, 400);
    if (!mongoose.Types.ObjectId.isValid(id)) return jsonResponse({ error: "Invalid id format" }, 400);

    const colName = String(collection);
    const existingCols = await listCollections();
    if (!existingCols.includes(colName)) return jsonResponse({ error: "Collection not found" }, 404);

    const Model = getModelForCollection(colName);

    const deleted = await Model.findByIdAndDelete(id);
    if (!deleted) return jsonResponse({ error: "Document not found" }, 404);
    return jsonResponse(deleted, 200);
  } catch (err) {
    console.error(err);
    return jsonResponse({ error: err.message || "Internal server error" }, 500);
  }
}
