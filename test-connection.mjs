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

const client = new Client(config);

async function testConnection() {
  try {
    console.log('🔍 Testing PostgreSQL connection...');
    console.log('📊 Connection config:', {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      password: '***', // Hide password
    });

    await client.connect();
    console.log('✅ Connected to PostgreSQL successfully!');

    // Test basic query
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL Version:', result.rows[0].version);

    // Test if we can create and drop a test table
    await client.query('CREATE TABLE IF NOT EXISTS test_connection (id SERIAL PRIMARY KEY, test_data VARCHAR(50))');
    await client.query('INSERT INTO test_connection (test_data) VALUES ($1)', ['connection_test']);
    const testResult = await client.query('SELECT * FROM test_connection WHERE test_data = $1', ['connection_test']);
    console.log('✅ Test table operations successful:', testResult.rowCount, 'rows affected');
    await client.query('DROP TABLE test_connection');

    console.log('🎉 All connection tests passed!');
  } catch (err) {
    console.error('❌ Connection test failed:');
    console.error('Error code:', err.code);
    console.error('Error message:', err.message);

    if (err.code === 'ECONNREFUSED') {
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Make sure PostgreSQL is running');
      console.log('2. Check if Docker containers are up: docker-compose ps');
      console.log('3. Verify port 5432 is accessible');
    } else if (err.code === '28P01') {
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Check username and password in .env file');
      console.log('2. Verify user exists in database');
    } else if (err.code === '3D000') {
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Check if database exists');
      console.log('2. Create database: CREATE DATABASE qa_automation;');
    }
  } finally {
    await client.end();
    console.log('📊 Connection closed');
  }
}

testConnection();
