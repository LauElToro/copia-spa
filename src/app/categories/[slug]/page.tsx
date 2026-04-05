import CategoryDetailPage from '@/presentation/categories/pages/category-detail-page';

interface Props {
  readonly params: { slug: string };
}

export default function Page({ params }: Readonly<Props>) {
  return <CategoryDetailPage slug={params.slug} />;
} 