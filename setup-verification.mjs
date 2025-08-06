import { Client } from 'pg';
import dotenv from 'dotenv';

// Load environment variables from pg.env
dotenv.config({ path: 'pg.env' });

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'qa_automation',
  user: process.env.DB_USER || 'qa_user',
  password: process.env.DB_PASSWORD || 'qa_password',
};

console.log('🔍 PostgreSQL Setup Verification');
console.log('================================');

async function runVerification() {
  const client = new Client(config);

  try {
    console.log('1. Testing database connection...');
    await client.connect();
    console.log('   ✅ Connected successfully!');

    console.log('\n2. Checking PostgreSQL version...');
    const versionResult = await client.query('SELECT version()');
    console.log(
      '   📊 Version:',
      versionResult.rows[0].version.split(' ')[0],
      versionResult.rows[0].version.split(' ')[1]
    );

    console.log('\n3. Testing user permissions...');
    await client.query('CREATE TABLE IF NOT EXISTS test_permissions (id SERIAL PRIMARY KEY, test_data VARCHAR(50))');
    console.log('   ✅ Can create tables');

    await client.query("INSERT INTO test_permissions (test_data) VALUES ('permission_test')");
    console.log('   ✅ Can insert data');

    const selectResult = await client.query('SELECT * FROM test_permissions WHERE test_data = $1', ['permission_test']);
    console.log('   ✅ Can select data -', selectResult.rowCount, 'row(s) found');

    await client.query('DROP TABLE test_permissions');
    console.log('   ✅ Can drop tables');

    console.log('\n4. Testing database configuration...');
    const configResult = await client.query(
      "SELECT name, setting FROM pg_settings WHERE name IN ('max_connections', 'shared_buffers', 'effective_cache_size')"
    );
    console.log('   📊 Database configuration:');
    configResult.rows.forEach(row => {
      console.log(`      ${row.name}: ${row.setting}`);
    });

    console.log('\n5. Testing time zone settings...');
    const timezoneResult = await client.query("SELECT NOW(), CURRENT_TIMESTAMP, timezone('UTC', NOW()) as utc_time");
    console.log('   🕐 Current time:', timezoneResult.rows[0].now);
    console.log('   🌍 UTC time:', timezoneResult.rows[0].utc_time);

    console.log('\n6. Testing JSON support...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_json (
        id SERIAL PRIMARY KEY, 
        data JSONB, 
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await client.query(
      `
      INSERT INTO test_json (data) VALUES ($1)
    `,
      [JSON.stringify({ test: true, message: 'JSON support working' })]
    );

    const jsonResult = await client.query('SELECT data FROM test_json ORDER BY id DESC LIMIT 1');
    console.log('   📄 JSON support:', jsonResult.rows[0].data.message);

    await client.query('DROP TABLE test_json');

    console.log('\n🎉 All verification tests passed!');
    console.log('\n📋 Summary:');
    console.log(`   • Database: ${config.database}`);
    console.log(`   • User: ${config.user}`);
    console.log(`   • Host: ${config.host}:${config.port}`);
    console.log('   • Permissions: ✅ Full access');
    console.log('   • JSON Support: ✅ Available');
    console.log('   • Time Zone: ✅ Configured');

    console.log('\n🚀 Ready to run PostgreSQL reporter!');
  } catch (err) {
    console.error('\n❌ Verification failed:');
    console.error('   Error:', err.message);
    console.error('   Code:', err.code);

    if (err.code === 'ECONNREFUSED') {
      console.log('\n🔧 Troubleshooting tips:');
      console.log('   1. Make sure PostgreSQL is running: brew services start postgresql@15');
      console.log('   2. Check if port 5432 is available: lsof -i :5432');
    } else if (err.code === '28P01') {
      console.log('\n🔧 Troubleshooting tips:');
      console.log('   1. Check username and password in .env file');
      console.log('   2. Verify user exists: psql postgres -c "\\du"');
    } else if (err.code === '3D000') {
      console.log('\n🔧 Troubleshooting tips:');
      console.log('   1. Create database: psql postgres -c "CREATE DATABASE qa_automation;"');
    } else if (err.code === '42501') {
      console.log('\n🔧 Troubleshooting tips:');
      console.log(
        '   1. Grant permissions: psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE qa_automation TO qa_user;"'
      );
    }

    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run verification
runVerification().catch(console.error);
