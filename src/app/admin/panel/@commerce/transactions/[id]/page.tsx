import TransactionDetailPage from '@/presentation/admin/panel/commerce/pages/transaction-detail-page';

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  return <TransactionDetailPage transactionId={params.id} />;
}

