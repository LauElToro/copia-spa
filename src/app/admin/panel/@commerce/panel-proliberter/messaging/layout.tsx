import ProLiberterLayout from '@/presentation/@shared/components/layouts/pro-liberter-layout';

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <ProLiberterLayout>{children}</ProLiberterLayout>;
} 