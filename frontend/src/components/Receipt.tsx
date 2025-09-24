import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Receipt as ReceiptType } from '../types';
import { Download, FileText, Calendar, DollarSign, Building } from 'lucide-react';

interface ReceiptProps {
  receipt: ReceiptType;
  onDownload?: () => void;
}

const ReceiptContainer = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f1f5f9;
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1a202c;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ReceiptNumber = styled.div`
  font-size: 14px;
  color: #718096;
  background: #f7fafc;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 500;
`;

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const InfoIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4a5568;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: 12px;
  color: #718096;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 16px;
  color: #1a202c;
  font-weight: 500;
`;

const AmountSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 20px;
  color: white;
  text-align: center;
`;

const AmountLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 8px;
`;

const AmountValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
`;

const AmountCurrency = styled.div`
  font-size: 14px;
  opacity: 0.8;
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
`;

const TaxInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #38a169;
  font-weight: 500;
`;

const DownloadButton = styled(motion.button)`
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #218838;
    transform: translateY(-1px);
  }
`;

const getReceiptTypeText = (type: string) => {
  switch (type) {
    case 'donation': return '기부금영수증';
    case 'carbon_offset': return '탄소상쇄영수증';
    default: return '영수증';
  }
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatAmount = (amount: number, currency: string) => {
  if (currency === 'KRW') {
    return `${amount.toLocaleString()}원`;
  }
  return `$${amount.toLocaleString()}`;
};

export const Receipt: React.FC<ReceiptProps> = ({ receipt, onDownload }) => {
  const handleDownload = () => {
    if (onDownload) {
      onDownload();
    } else if (receipt.pdfUrl) {
      window.open(receipt.pdfUrl, '_blank');
    }
  };

  return (
    <ReceiptContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Header>
        <Title>
          <FileText size={24} />
          {getReceiptTypeText(receipt.type)}
        </Title>
        <ReceiptNumber>영수증번호: {receipt.receiptNumber}</ReceiptNumber>
      </Header>

      <Content>
        <InfoSection>
          <InfoItem>
            <InfoIcon>
              <Building size={20} />
            </InfoIcon>
            <InfoContent>
              <InfoLabel>발급 기관</InfoLabel>
              <InfoValue>{receipt.issuedBy}</InfoValue>
            </InfoContent>
          </InfoItem>

          <InfoItem>
            <InfoIcon>
              <Calendar size={20} />
            </InfoIcon>
            <InfoContent>
              <InfoLabel>발급 일자</InfoLabel>
              <InfoValue>{formatDate(receipt.issuedAt)}</InfoValue>
            </InfoContent>
          </InfoItem>

          <InfoItem>
            <InfoIcon>
              <DollarSign size={20} />
            </InfoIcon>
            <InfoContent>
              <InfoLabel>금액</InfoLabel>
              <InfoValue>{formatAmount(receipt.amount, receipt.currency)}</InfoValue>
            </InfoContent>
          </InfoItem>
        </InfoSection>

        <AmountSection>
          <AmountLabel>총 금액</AmountLabel>
          <AmountValue>{formatAmount(receipt.amount, receipt.currency)}</AmountValue>
          <AmountCurrency>{receipt.currency}</AmountCurrency>
        </AmountSection>
      </Content>

      <Footer>
        <TaxInfo>
          {receipt.taxDeductible ? (
            <>
              ✅ 세액공제 가능
            </>
          ) : (
            <>
              ❌ 세액공제 불가능
            </>
          )}
        </TaxInfo>

        <DownloadButton
          onClick={handleDownload}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download size={16} />
          PDF 다운로드
        </DownloadButton>
      </Footer>
    </ReceiptContainer>
  );
};
