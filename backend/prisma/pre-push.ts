import { Pool } from 'pg';
import "dotenv/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not set in environment.");
  process.exit(1);
}

async function run() {
  console.log("🔄 Connecting to PostgreSQL to migrate Orange Money records to KONOOM...");
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // 1. Update Payment records
    console.log("   Updating payments...");
    const paymentsRes = await pool.query(
      `UPDATE "Payment" SET "paymentMethod" = 'KONOOM_MONEY'::"PaymentMethod" WHERE "paymentMethod" = 'ORANGE_MONEY'::"PaymentMethod"`
    );
    console.log(`   ✅ Updated ${paymentsRes.rowCount} payment records.`);

    // 2. Delete Provider record
    console.log("   Deleting orange provider...");
    const providerRes = await pool.query(
      `DELETE FROM "Provider" WHERE "name" = 'orange'`
    );
    console.log(`   ✅ Deleted orange provider.`);
  } catch (error) {
    console.error("❌ Migration queries failed:", error);
  } finally {
    await pool.end();
    console.log("👋 Done.");
  }
}

run();
