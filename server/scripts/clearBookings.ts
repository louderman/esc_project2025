import { pool } from '../database/db';

async function clearBookings(): Promise<void> {
  try {
    // Identify current DB
    const [dbRows]: any = await pool.query('SELECT DATABASE() AS db');
    const dbName = dbRows?.[0]?.db ?? '(unknown)';
    console.log(`[db:clear-bookings] Using database: ${dbName}`);

    // Disable FK checks to allow truncation in correct order
    await pool.query('SET FOREIGN_KEY_CHECKS = 0;');

    // Clear child table first
    try {
      await pool.query('TRUNCATE TABLE `guest_information`;');
      console.log('[db:clear-bookings] Truncated guest_information');
    } catch (err: any) {
      // Ignore if table does not exist yet
      if (err && err.code !== 'ER_NO_SUCH_TABLE') {
        console.error('[db:clear-bookings] Failed to truncate guest_information', err);
        throw err;
      } else {
        console.log('[db:clear-bookings] guest_information does not exist, skipping');
      }
    }

    // Clear parent table
    try {
      await pool.query('TRUNCATE TABLE `bookings`;');
      console.log('[db:clear-bookings] Truncated bookings');
    } catch (err: any) {
      if (err && err.code !== 'ER_NO_SUCH_TABLE') {
        console.error('[db:clear-bookings] Failed to truncate bookings', err);
        throw err;
      } else {
        console.log('[db:clear-bookings] bookings does not exist, skipping');
      }
    }

    // Re-enable FK checks
    await pool.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('[db:clear-bookings] Completed successfully.');
  } catch (err) {
    console.error('[db:clear-bookings] Error clearing bookings:', err);
    process.exitCode = 1;
  } finally {
    try {
      await pool.end();
    } catch (e) {
      // ignore pool end errors
    }
  }
}

clearBookings();
