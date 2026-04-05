import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';
import { NotificationBanner } from '@/presentation/@shared/components/ui/atoms/notification-banner';
import { useOptionalAuthContext } from '@/presentation/@shared/contexts/auth-context';
import { useProductEngagements } from '@/presentation/@shared/hooks/use-product-engagements';
import { axiosHelper } from '@/presentation/@shared/helpers/axios-helper';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import { CompactTestimonialCard } from '@/presentation/sellers/components/compact-testimonial-card/compact-testimonial-card';
import { LoadingSpinner } from '@/presentation/@shared/components/ui/atoms/loading-spinner';
import "./reviews.css";
import { ProductEntity } from '@/presentation/@shared/types/product';

interface ReviewsProps {
    product: ProductEntity;
}

interface ReviewWithUser {
    id: string;
    accountId?: string;
    rating?: number;
    title?: string;
    comment?: string;
    createdAt: string;
    userName?: string;
    userAvatar?: string;
}

const Reviews: React.FC<ReviewsProps> = ({ product }) => {
    const router = useRouter();
    const { t } = useLanguage();
    const authContext = useOptionalAuthContext();
    const isAuthenticated = authContext?.isAuthenticated ?? false;
    const authLoading = authContext?.isLoading ?? false;

    // Obtener reseñas del backend
    const { getReviews } = useProductEngagements(product.id);
    const reviewsData = getReviews;

    // Enriquecer reseñas con información del usuario
    const enrichedReviewsQuery = useQuery({
        queryKey: ['reviews-enriched', product.id, reviewsData.data?.map(r => r.accountId).filter(Boolean)],
        queryFn: async (): Promise<ReviewWithUser[]> => {
            if (!reviewsData.data || reviewsData.data.length === 0) {
                return [];
            }

            // Obtener información de usuarios únicos
            const uniqueAccountIds = Array.from(
                new Set(reviewsData.data.map(r => r.accountId).filter(Boolean) as string[])
            );

            // Fetch user info en paralelo
            const userInfoPromises = uniqueAccountIds.map(async (accountId) => {
                try {
                    const response = await axiosHelper.account.getUserById(accountId);
                    const apiResponse = response.data as unknown as {
                        success: boolean;
                        data: {
                            id: string;
                            firstName?: string;
                            lastName?: string;
                            name?: string;
                            email?: string;
                            avatar?: string;
                        };
                    };
                    if (apiResponse.success && apiResponse.data) {
                        return {
                            accountId,
                            name: apiResponse.data.firstName && apiResponse.data.lastName
                                ? `${apiResponse.data.firstName} ${apiResponse.data.lastName}`
                                : apiResponse.data.name || apiResponse.data.email || t.common.user,
                            avatar: apiResponse.data.avatar || '/images/icons/avatar.png',
                        };
                    }
                } catch (error) {
                    console.error(`Error fetching user info for ${accountId}:`, error);
                }
                return {
                    accountId,
                    name: t.common.user,
                    avatar: '/images/icons/avatar.png',
                };
            });

            const userInfoMap = new Map(
                (await Promise.all(userInfoPromises)).map(info => [info.accountId, info])
            );

            // Enriquecer reseñas con información del usuario
            const enriched = reviewsData.data
                .filter(r => r.eventType === 'REVIEW' && r.rating && r.rating > 0)
                .map(review => {
                    const userInfo = review.accountId ? userInfoMap.get(review.accountId) : null;
                    return {
                        id: review.id,
                        accountId: review.accountId,
                        rating: review.rating,
                        title: review.title,
                        comment: review.comment,
                        createdAt: review.createdAt,
                        userName: userInfo?.name || t.common.user,
                        userAvatar: userInfo?.avatar || '/images/icons/avatar.png',
                    };
                });

            // Ordenar por fecha de creación descendente (más nueva primero)
            return enriched.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return dateB - dateA; // Descendente: más nueva primero
            });
        },
        enabled: !!reviewsData.data && reviewsData.data.length > 0 && typeof window !== 'undefined',
        staleTime: 5 * 60 * 1000,
    });

    const reviews = enrichedReviewsQuery.data || [];
    const isLoadingReviews = reviewsData.isLoading || enrichedReviewsQuery.isLoading;

    const hasReviews = useMemo(
        () => !isLoadingReviews && reviews.length > 0,
        [isLoadingReviews, reviews.length],
    );

    if (isLoadingReviews) {
        return (
            <>
                <Text 
                    variant="h5" 
                    sx={{
                        fontSize: { xs: '1rem', md: '1.125rem' },
                        fontWeight: 700,
                        color: '#ffffff',
                        marginBottom: { xs: 2, md: 3 },
                        marginTop: 0
                    }}
                >
                    {t.shop.userReviews}
                </Text>
                <Box sx={{ textAlign: 'center', py: 3 }}>
                    <LoadingSpinner color="success" size="large" />
                </Box>
            </>
        );
    }

    if (!hasReviews) {
        return (
            <>
                <Text 
                    variant="h5" 
                    sx={{
                        fontSize: { xs: '1rem', md: '1.125rem' },
                        fontWeight: 700,
                        color: '#ffffff',
                        marginBottom: { xs: 2, md: 3 },
                        marginTop: 0
                    }}
                >
                    {t.shop.userReviews}
                </Text>
                <NotificationBanner
                    variant="success"
                    title={t.shop.noReviewsYet}
                    description={
                        isAuthenticated
                            ? t.shop.beFirstToReview
                            : t.shop.loginToReview
                    }
                    action={
                        !isAuthenticated && !authLoading
                            ? {
                                label: t.shop.login,
                                onClick: () => router.push('/login'),
                            }
                            : undefined
                    }
                />
            </>
        );
    }

    return (
        <>
            <Text 
                variant="h5" 
                sx={{
                    fontSize: { xs: '1rem', md: '1.125rem' },
                    fontWeight: 700,
                    color: '#ffffff',
                    marginBottom: { xs: 2, md: 3 },
                    marginTop: 0
                }}
            >
                {t.shop.userReviews}
            </Text>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)',
                        lg: 'repeat(4, 1fr)'
                    },
                    gap: { xs: 2, md: 3 },
                    width: '100%'
                }}
            >
                {reviews.map((review) => (
                    <CompactTestimonialCard
                        key={review.id}
                        id={review.id}
                        image={review.userAvatar || '/images/icons/avatar.png'}
                        title={review.userName || t.common.user}
                        description={review.title ? `${review.title}\n${review.comment || ''}`.trim() : (review.comment || '')}
                        rating={review.rating}
                    />
                ))}
            </Box>
        </>
    );
};

export default Reviews;
