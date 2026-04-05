import React, { useMemo, useState } from 'react';
import { Text } from '@/presentation/@shared/components/ui/atoms/text';
import { useRouter } from 'next/navigation';
import { useOptionalAuthContext } from '@/presentation/@shared/contexts/auth-context';
import { ProductEntity } from '@/presentation/@shared/types/product';
import { NotificationBanner } from '@/presentation/@shared/components/ui/atoms/notification-banner';
import { LoadingSpinner } from '@/presentation/@shared/components/ui/atoms/loading-spinner';
import { QuestionComposer } from '@/presentation/@shared/components/ui/molecules/question-composer';
import { ModernQuestionThread } from '@/presentation/@shared/components/ui/organisms/modern-question-thread/modern-question-thread';
import { EmptyState } from '@/presentation/@shared/components/ui/atoms/empty-state';
import { useProductQuestions } from '@/presentation/@shared/hooks/use-product-questions';
import { useToast } from '@/presentation/@shared/components/ui/molecules/toast';
import { QuestionNode } from '@/presentation/@shared/types/questions';
import { Pagination } from '@/presentation/@shared/components/ui/molecules/pagination';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import './questions.css';

interface QuestionsProps {
  product: ProductEntity;
}

const Questions: React.FC<QuestionsProps> = ({ product }) => {
  const router = useRouter();
  const { t } = useLanguage();
  const toast = useToast();
  const authContext = useOptionalAuthContext();
  const isAuthenticated = authContext?.isAuthenticated ?? false;
  const authLoading = authContext?.isLoading ?? false;
  const userId = authContext?.user?.id;

  const [activeParentId, setActiveParentId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const limit = 5;

  const {
    questions,
    pagination,
    isLoading,
    isError,
    error,
    createQuestion,
    createQuestionStatus,
    refreshQuestions,
  } = useProductQuestions(product.id, { page, limit });

  // Obtener el account_id del owner del producto
  const productOwnerId = product.account_id;

  // Check if the current user is the product owner - owners cannot post questions on their own products
  const isProductOwner = Boolean(userId && productOwnerId && userId === productOwnerId);

  // Users can submit questions only if authenticated AND not the product owner
  const canSubmit = isAuthenticated && Boolean(userId) && !isProductOwner;

  // canReply ahora se controla en ModernQuestionThread basado en quién es el autor del nodo
  // Permitimos que cualquier usuario autenticado pueda tener canReply=true
  // pero ModernQuestionThread decidirá si realmente puede responder según las reglas

  const handleAuthRedirect = () => {
    router.push('/login');
  };

  const handlePublish = async (content: string, parentQuestionId?: string) => {
    if (!canSubmit) {
      toast.warning(t.shop.loginToAsk, { duration: 3000, position: "bottom-center" });
      handleAuthRedirect();
      return;
    }

    try {
      setActiveParentId(parentQuestionId ?? null);
      if (!parentQuestionId) {
        setPage(1);
      }
      await createQuestion({
        productId: product.id,
        accountId: userId as string,
        content,
        parentQuestionId,
      });
      toast.success(t.shop.questionPublishedSuccess, { duration: 3000, position: "bottom-center" });
      await refreshQuestions();
    } catch (publishError) {
      console.error('Error publishing question', publishError);
      toast.error(t.shop.questionPublishError, { duration: 3000, position: "bottom-center" });
    } finally {
      setActiveParentId(null);
    }
  };

  const handleRootSubmit = (content: string) => handlePublish(content);
  const handleReplySubmit = (parentId: string, content: string) => handlePublish(content, parentId);

  const emptyState = useMemo(() => (
    <EmptyState
      title={t.shop.noQuestionsYet}
      message={t.shop.beFirstToAsk}
    />
  ), [t]);

  const normalizedQuestions = useMemo<QuestionNode[]>(() => questions, [questions]);
  const currentPage = pagination?.page ?? page;
  const totalPages = pagination?.totalPages ?? 0;
  const totalQuestions = pagination?.total ?? 0;
  const showingFrom = totalQuestions === 0 ? 0 : (currentPage - 1) * limit + 1;
  const showingTo = totalQuestions === 0
    ? 0
    : Math.min(currentPage * limit, totalQuestions);

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
  };

  const renderFormSection = () => {
    if (authLoading) {
      return (
        <div className="questions-auth-loading">
          <div className="spinner-border text-success" role="status" aria-live="polite">
            <span className="visually-hidden">{t.shop.loadingAuth}</span>
          </div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <NotificationBanner
          variant="success"
          className="questions-auth-banner"
          title={t.shop.questionsLoginRequired}
          description=""
          iconName="login"
          action={{
            label: t.shop.login,
            onClick: handleAuthRedirect,
          }}
        />
      );
    }

    // Product owner cannot post questions on their own products
    if (isProductOwner) {
      return (
        <NotificationBanner
          variant="info"
          className="questions-owner-banner"
          title={t.shop.cannotAskOwnProduct || "No puedes hacer preguntas sobre tu propio producto"}
          description={t.shop.cannotAskOwnProductDescription || "Como dueño del producto, puedes responder las preguntas de los clientes"}
          iconName="store"
        />
      );
    }

    return (
      <QuestionComposer
        label=""
        placeholder={t.shop.writeQuestion}
        onSubmit={handleRootSubmit}
        isSubmitting={createQuestionStatus.isPending && activeParentId === null}
        submitLabel={t.shop.publishQuestion}
        submittingLabel={t.shop.publishing}
      />
    );
  };

  return (
    <>
      <div className="questions-container" style={{ width: '100%' }}>
        {renderFormSection()}

        {isLoading && (
          <div className="questions-loader">
            <LoadingSpinner className="question-spinner" color="success" />
          </div>
        )}

        {isError && (
          <NotificationBanner
            variant="danger"
            title={t.shop.questionsLoadError}
            description={(error as Error)?.message ?? t.shop.questionsUnexpectedError}
            action={{
              label: t.shop.retry,
              onClick: () => {
                void refreshQuestions();
              },
            }}
          />
        )}

        {!isLoading && !isError && (
          <>
            <div className="questions-summary">
              <Text
                color="#ffffff"
                variant="span"
                sx={{
                  fontSize: { xs: '0.875rem', md: '0.9375rem' },
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 400
                }}
              >
                {totalQuestions === 0
                  ? t.shop.noQuestionsFound
                  : t.shop.showingQuestions.replace('{from}', showingFrom.toString()).replace('{to}', showingTo.toString()).replace('{total}', totalQuestions.toString())}
              </Text>
            </div>

            <ModernQuestionThread
              nodes={normalizedQuestions}
              canReply={canSubmit}
              onReply={handleReplySubmit}
              submittingParentId={createQuestionStatus.isPending ? activeParentId : null}
              emptyState={emptyState}
              currentAccountId={userId || null}
              productOwnerId={productOwnerId || null}
            />

            {totalPages > 1 && (
              <div className="questions-pagination">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  maxVisiblePages={5}
                />
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Questions;
