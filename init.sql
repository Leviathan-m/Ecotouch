-- Eco Touch Database Initialization Script
-- PostgreSQL initialization for production deployment

-- Create database if it doesn't exist
-- Note: Railway handles this automatically, but keeping for reference

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    language_code VARCHAR(10),
    wallet_address VARCHAR(255),
    is_premium BOOLEAN DEFAULT FALSE,
    total_impact INTEGER DEFAULT 0,
    missions_completed INTEGER DEFAULT 0,
    badges_earned INTEGER DEFAULT 0,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create missions table
CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('carbon_offset', 'donation', 'petition')),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    impact INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'KRW',
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    external_api_id VARCHAR(255),
    external_transaction_id VARCHAR(255),
    blockchain_tx_hash VARCHAR(255),
    sbt_token_id VARCHAR(255),
    receipt_id UUID,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    logs JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mission_id UUID REFERENCES missions(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('carbon_offset', 'donation', 'petition')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'KRW',
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    external_tx_id VARCHAR(255),
    blockchain_tx_hash VARCHAR(255),
    gas_used BIGINT,
    gas_price DECIMAL(20,0),
    fee_amount DECIMAL(10,2),
    tax_deductible BOOLEAN DEFAULT FALSE,
    receipt_issued BOOLEAN DEFAULT FALSE,
    receipt_id UUID,
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create receipts table
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('carbon_offset', 'donation', 'petition')),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'KRW',
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    issued_by VARCHAR(255) NOT NULL,
    tax_deductible BOOLEAN DEFAULT FALSE,
    tax_year INTEGER,
    pdf_url VARCHAR(500),
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON users(telegram_id);
CREATE INDEX IF NOT EXISTS idx_missions_user_id ON missions(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_receipt_number ON receipts(receipt_number);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON missions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_receipts_updated_at BEFORE UPDATE ON receipts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- This will only run if tables are empty
INSERT INTO users (telegram_id, username, first_name, last_name, language_code, total_impact, missions_completed, badges_earned)
SELECT 123456789, 'demo_user', 'Demo', 'User', 'ko', 100, 5, 2
WHERE NOT EXISTS (SELECT 1 FROM users WHERE telegram_id = 123456789);

-- Sample mission
INSERT INTO missions (user_id, type, title, description, impact, cost, currency, status, created_at)
SELECT u.id, 'carbon_offset', '탄소 배출량 상쇄', '일상 생활에서 발생하는 탄소 배출량을 상쇄합니다.', 25, 5000, 'KRW', 'pending', NOW()
FROM users u WHERE u.telegram_id = 123456789
AND NOT EXISTS (SELECT 1 FROM missions WHERE user_id = u.id AND type = 'carbon_offset' LIMIT 1);

-- Sample transaction
INSERT INTO transactions (user_id, type, amount, currency, status, created_at)
SELECT u.id, 'carbon_offset', 5000, 'KRW', 'pending', NOW()
FROM users u WHERE u.telegram_id = 123456789
AND NOT EXISTS (SELECT 1 FROM transactions WHERE user_id = u.id LIMIT 1);

-- Grant permissions (Railway handles this automatically)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ecotouch_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ecotouch_user;
