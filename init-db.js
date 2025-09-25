const { Client } = require('pg');
const fs = require('fs');

const client = new Client({
  connectionString: 'postgres://postgres.ufdwvvuxsmewigtbpzzm:9doIfpwQPtMDAHkn@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function initDatabase() {
  try {
    console.log('🔄 Supabase 데이터베이스 초기화 중...');

    await client.connect();
    console.log('✅ 데이터베이스 연결 성공!');

    // init.sql 파일 읽기
    const sqlScript = fs.readFileSync('./init.sql', 'utf8');

    // SQL 스크립트를 세미콜론으로 분리해서 실행
    const statements = sqlScript.split(';').filter(stmt => stmt.trim().length > 0);

    console.log(`📄 ${statements.length}개의 SQL 구문 실행 중...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement.length === 0) continue;

      try {
        await client.query(statement);
        console.log(`✅ 구문 ${i + 1}/${statements.length} 실행 완료`);
      } catch (error) {
        // 일부 에러는 무시 (이미 존재하는 경우 등)
        if (error.code === '42P07' || error.code === '23505' || error.message.includes('already exists')) {
          console.log(`⚠️  구문 ${i + 1}/${statements.length} 이미 존재함 (무시)`);
        } else {
          console.log(`❌ 구문 ${i + 1}/${statements.length} 실패:`, error.message);
        }
      }
    }

    // 초기화 확인
    console.log('\n📋 생성된 테이블 확인:');
    const tablesResult = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    // 샘플 데이터 확인
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    const missionCount = await client.query('SELECT COUNT(*) as count FROM missions');

    console.log(`\n👤 사용자 수: ${userCount.rows[0].count}`);
    console.log(`🎯 미션 수: ${missionCount.rows[0].count}`);

    console.log('\n🎉 Supabase 데이터베이스 초기화 완료!');

  } catch (error) {
    console.error('❌ 데이터베이스 초기화 실패:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

initDatabase();
