export const heroBannerTheme = {
  container: 'relative h-[400px] overflow-hidden rounded-lg',
  image: 'w-full h-full object-cover',
  overlay: 'absolute inset-0 bg-black bg-opacity-50',
  content: 'absolute inset-0 flex flex-col justify-center items-center text-white p-8',
  title: 'text-4xl font-bold mb-4',
  description: 'text-lg text-center max-w-2xl',
} as const; 