import TransactionReviewPage from '@/presentation/admin/panel/commerce/pages/transaction-review-page';

interface PageProps {
  params: {
    id: string;
  };
}

export default function Page({ params }: PageProps) {
  return <TransactionReviewPage transactionId={params.id} />;
}

