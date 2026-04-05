import React from 'react';
import { Box, Card, CardContent, CardMedia } from '@mui/material';
import Link from 'next/link';
import { Image } from '@/presentation/@shared/components/ui/atoms/image';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';
import { Grid } from '@mui/material';
import { Stack } from '@/presentation/@shared/components/ui/molecules/stack';
import { ProductEntity } from '@/presentation/@shared/types/product';
import { getPrimaryImage } from '@/presentation/@shared/utils/product-mapper';

interface RelatedProductsProps {
  product: ProductEntity;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ product }) => {
  const related = (product as ProductEntity & { related?: ProductEntity[] }).related;
  if (!related || related.length === 0) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <Text variant="h5" fontWeight="bold">Los usuarios también vieron:</Text>
      <Grid container spacing={2}>
        {related.map((rel) => (
          <Grid size={{ xs: 12, md: 4 }} key={rel.id}>
            <Box
              component={Link}
              href={`/product/${rel.id}`}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                display: 'block',
                height: '100%',
              }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 2,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardMedia>
                  <Image
                    src={getPrimaryImage(rel)}
                    alt={rel.name}
                    width={300}
                    height={180}
                    objectFit="cover"
                    sx={{
                      width: '100%',
                      height: 180,
                      objectFit: 'cover',
                    }}
                  />
                </CardMedia>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Text variant="body1" fontWeight={600} sx={{ minHeight: 48, marginBottom: 1 }}>
                    {rel.name}
                  </Text>
                  <Text variant="h6" color="success.main" fontWeight="bold">
                    {rel.price} {rel.crypto}
                  </Text>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default RelatedProducts;
