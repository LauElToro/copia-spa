import StorePage from '@/presentation/stores/pages/store-page';

export default function Page({ params }: Readonly<{ params: { id: string } }>) {
  return <StorePage storeId={params.id} />;
}
