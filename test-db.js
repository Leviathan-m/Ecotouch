const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres.ufdwvvuxsmewigtbpzzm:9doIfpwQPtMDAHkn@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('🔄 Supabase 데이터베이스 연결 테스트 중...');

    await client.connect();
    console.log('✅ 데이터베이스 연결 성공!');

    // 현재 데이터베이스 정보 확인
    const result = await client.query('SELECT version()');
    console.log('📊 PostgreSQL 버전:', result.rows[0].version);

    // 기존 테이블 확인
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log('📋 기존 테이블들:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // 샘플 쿼리 실행
    const testQuery = await client.query('SELECT NOW() as current_time');
    console.log('🕐 현재 시간:', testQuery.rows[0].current_time);

    console.log('🎉 Supabase 연결 테스트 완료!');

  } catch (error) {
    console.error('❌ 데이터베이스 연결 실패:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

testConnection();
