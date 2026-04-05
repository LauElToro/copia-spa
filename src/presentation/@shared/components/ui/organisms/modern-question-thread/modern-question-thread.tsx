'use client';

import React, { useState } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { QuestionNode, AnswerNode } from '@/presentation/@shared/types/questions';
import { Button } from '@/presentation/@shared/components/ui/atoms/button';
import { Textarea } from '@/presentation/@shared/components/ui/atoms/textarea';
import { Image } from '@/presentation/@shared/components/ui/atoms/image';
import { ArrowForward, VerifiedUser } from '@mui/icons-material';
import { useLanguage } from '@/presentation/@shared/hooks/use-language';
import './modern-question-thread.css';

const formatDate = (value: string, locale: string = 'es-AR'): string => {
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat(locale === 'es' ? 'es-AR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return value;
  }
};

// Componente para mostrar respuestas del vendedor
interface AnswerItemProps {
  answer: AnswerNode;
}

const AnswerItem: React.FC<AnswerItemProps> = ({ answer }) => {
  const { t, language } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);

  const avatarUrl = answer.author?.avatarUrl || '/images/icons/avatar.png';
  const authorName = answer.author?.name || t.shop.seller;

  return (
    <Box
      className="modern-question-thread__answer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        gap: { xs: 1.5, md: 2 },
        background: 'linear-gradient(135deg, rgba(41, 196, 128, 0.08), rgba(0, 0, 0, 0.5))',
        border: '1px solid rgba(41, 196, 128, 0.25)',
        borderRadius: '16px',
        padding: { xs: 1.5, md: 2 },
        overflow: 'hidden',
        boxSizing: 'border-box',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        '&:hover': {
          borderColor: 'rgba(41, 196, 128, 0.5)',
          background: 'linear-gradient(135deg, rgba(41, 196, 128, 0.12), rgba(0, 0, 0, 0.6))'
        }
      }}
    >
      {/* Avatar Container */}
      <Box
        sx={{
          flexShrink: 0,
          width: { xs: 40, md: 48 },
          height: { xs: 40, md: 48 },
          minWidth: { xs: 40, md: 48 },
          minHeight: { xs: 40, md: 48 },
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: 'rgba(41, 196, 128, 0.2)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          aspectRatio: '1 / 1',
          border: '2px solid rgba(41, 196, 128, 0.4)',
          '& img': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            borderRadius: '50%',
            transition: 'transform 0.4s ease',
            transform: isHovered ? 'scale(1.2)' : 'scale(1.1)',
            display: 'block',
            margin: 0,
            padding: 0
          }
        }}
      >
        <Image
          src={avatarUrl}
          alt={authorName}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            borderRadius: '50%',
            display: 'block',
            margin: 0,
            padding: 0,
            transform: isHovered ? 'scale(1.2)' : 'scale(1.1)',
            transition: 'transform 0.4s ease'
          }}
        />
      </Box>

      {/* Content Container */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          minWidth: 0,
          maxWidth: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.25
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography
              sx={{
                fontSize: { xs: '0.8125rem', md: '0.875rem' },
                fontWeight: 600,
                color: '#34d399',
                margin: 0,
                padding: 0,
                lineHeight: 1.3
              }}
            >
              {authorName}
            </Typography>
            <VerifiedUser
              sx={{
                fontSize: { xs: 14, md: 16 },
                color: '#34d399',
                opacity: 0.9
              }}
            />
            <Typography
              component="span"
              sx={{
                fontSize: { xs: '0.625rem', md: '0.6875rem' },
                fontWeight: 500,
                color: '#34d399',
                backgroundColor: 'rgba(41, 196, 128, 0.15)',
                px: 1,
                py: 0.25,
                borderRadius: '4px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
            >
              {t.shop.officialResponse || 'Respuesta oficial'}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontSize: { xs: '0.6875rem', md: '0.75rem' },
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.5)',
              margin: 0,
              padding: 0,
              lineHeight: 1.2
            }}
          >
            {formatDate(answer.createdAt, language)}
          </Typography>
        </Box>

        {/* Content */}
        <Typography
          sx={{
            fontSize: { xs: '0.8125rem', md: '0.875rem' },
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.9)',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            margin: 0
          }}
        >
          {answer.content}
        </Typography>
      </Box>
    </Box>
  );
};

interface QuestionNodeItemProps {
  node: QuestionNode;
  depth: number;
  canReply: boolean;
  onReply: (parentId: string, content: string) => Promise<void>;
  submittingParentId?: string | null;
  currentAccountId?: string | null;
  productOwnerId?: string | null;
}

const QuestionNodeItem: React.FC<QuestionNodeItemProps> = ({
  node,
  depth,
  canReply,
  onReply,
  submittingParentId,
  currentAccountId,
  productOwnerId,
}) => {
  const { t, language } = useLanguage();
  const [isReplying, setIsReplying] = useState(false);
  const [replyValue, setReplyValue] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const isSubmitting = submittingParentId === node.id;

  // Determinar quién puede responder
  const isNodeFromOwner = productOwnerId && node.accountId === productOwnerId;
  const isCurrentUserOwner = productOwnerId && currentAccountId === productOwnerId;
  const isCurrentUserAuthor = currentAccountId && node.accountId === currentAccountId;

  let canReplyToThisQuestion = false;

  if (canReply && currentAccountId && !isCurrentUserAuthor) {
    if (isNodeFromOwner) {
      canReplyToThisQuestion = true;
    } else {
      canReplyToThisQuestion = Boolean(isCurrentUserOwner);
    }
  }

  const handleReply = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!replyValue.trim() || isSubmitting) {
      return;
    }

    await onReply(node.id, replyValue.trim());
    setReplyValue('');
    setIsReplying(false);
  };

  const avatarUrl = node.author?.avatarUrl || '/images/icons/avatar.png';
  const authorName = node.author?.name || t.common.user;

  return (
    <Box
      className="modern-question-thread__node"
      data-depth={depth}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        gap: { xs: 1.5, md: 2 },
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.2), rgba(0, 0, 0, 0.6))',
        border: '1px solid rgba(41, 196, 128, 0.1)',
        borderRadius: '16px',
        padding: { xs: 1.5, md: 2 },
        overflow: 'hidden',
        boxSizing: 'border-box',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'default',
        '&:hover': {
          borderColor: 'rgba(41, 196, 128, 0.4)',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.3), rgba(0, 0, 0, 0.7))'
        }
      }}
    >
        {/* Avatar Container */}
      <Box
        sx={{
          flexShrink: 0,
          width: { xs: 40, md: 48 },
          height: { xs: 40, md: 48 },
          minWidth: { xs: 40, md: 48 },
          minHeight: { xs: 40, md: 48 },
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          aspectRatio: '1 / 1',
          '& img': {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            borderRadius: '50%',
            transition: 'transform 0.4s ease',
            transform: isHovered ? 'scale(1.2)' : 'scale(1.1)',
            display: 'block',
            margin: 0,
            padding: 0
          }
        }}
      >
        <Image
          src={avatarUrl}
          alt={authorName}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            borderRadius: '50%',
            display: 'block',
            margin: 0,
            padding: 0,
            transform: isHovered ? 'scale(1.2)' : 'scale(1.1)',
            transition: 'transform 0.4s ease'
          }}
        />
      </Box>

        {/* Content Container */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          minWidth: 0,
          maxWidth: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.25
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: '0.8125rem', md: '0.875rem' },
              fontWeight: 600,
              color: '#34d399',
              margin: 0,
              padding: 0,
              lineHeight: 1.3
            }}
          >
            {authorName}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: '0.6875rem', md: '0.75rem' },
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.5)',
              margin: 0,
              padding: 0,
              lineHeight: 1.2
            }}
          >
            {formatDate(node.createdAt, language)}
          </Typography>
        </Box>

        {/* Content */}
        <Typography
          sx={{
            fontSize: { xs: '0.8125rem', md: '0.875rem' },
            lineHeight: 1.6,
            color: 'rgba(255, 255, 255, 0.85)',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
            whiteSpace: 'pre-wrap',
            margin: 0
          }}
        >
          {node.content}
        </Typography>

        {/* Actions */}
        {canReplyToThisQuestion && !isReplying && (
          <Box sx={{ mt: 1 }}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsReplying(true)}
              sx={{
                minWidth: 'auto',
                px: 2,
                py: 1,
                fontSize: { xs: '0.75rem', md: '0.8125rem' },
                textTransform: 'none',
                borderRadius: '8px'
              }}
            >
              {t.shop.respond}
            </Button>
          </Box>
        )}

        {/* Reply Form */}
        {canReplyToThisQuestion && isReplying && (
          <Box
            component="form"
            onSubmit={handleReply}
            sx={{
              mt: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              padding: 2,
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '12px',
              border: '1px solid rgba(41, 196, 128, 0.2)'
            }}
          >
            <Textarea
              value={replyValue}
              onChange={(event) => setReplyValue(event.target.value)}
              placeholder={t.shop.writeReply}
              maxLength={500}
              rows={3}
              disabled={isSubmitting}
              state="transparent"
            />
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1
              }}
            >
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsReplying(false);
                  setReplyValue('');
                }}
                disabled={isSubmitting}
                sx={{
                  minWidth: 'auto',
                  px: 2,
                  py: 1,
                  fontSize: { xs: '0.75rem', md: '0.8125rem' },
                  textTransform: 'none',
                  borderRadius: '8px'
                }}
              >
                {t.common.cancel}
              </Button>
              <Button
                type="submit"
                variant="success"
                size="sm"
                disabled={isSubmitting || replyValue.trim().length === 0}
                sx={{
                  minWidth: 'auto',
                  px: 3,
                  py: 1,
                  fontSize: { xs: '0.75rem', md: '0.8125rem' },
                  textTransform: 'none',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {isSubmitting ? t.shop.publishingReply : t.shop.publish}
                {!isSubmitting && <ArrowForward sx={{ fontSize: 16 }} />}
              </Button>
            </Box>
          </Box>
        )}

        {/* Official Answers from Seller */}
        {node.answers && node.answers.length > 0 && (
          <Box
            sx={{
              mt: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              position: 'relative',
              paddingLeft: { xs: 1.5, md: 2 },
              borderLeft: '2px solid',
              borderImage: 'linear-gradient(180deg, rgba(41, 196, 128, 0.5) 0%, rgba(41, 196, 128, 0.2) 100%) 1',
              marginLeft: { xs: 0.5, md: 1 }
            }}
          >
            {node.answers.map((answer) => (
              <AnswerItem key={answer.id} answer={answer} />
            ))}
          </Box>
        )}

        {/* Children (Replies) */}
        {node.children.length > 0 && (
          <Box
            sx={{
              mt: 1.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              position: 'relative',
              paddingLeft: { xs: 1.5, md: 2 },
              borderLeft: '2px solid',
              borderImage: 'linear-gradient(180deg, rgba(41, 196, 128, 0.3) 0%, rgba(41, 196, 128, 0.1) 100%) 1',
              marginLeft: { xs: 0.5, md: 1 }
            }}
          >
            {node.children.map((child) => (
              <QuestionNodeItem
                key={child.id}
                node={child}
                depth={depth + 1}
                canReply={canReply}
                onReply={onReply}
                submittingParentId={submittingParentId}
                currentAccountId={currentAccountId}
                productOwnerId={productOwnerId}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

interface ModernQuestionThreadProps {
  nodes: QuestionNode[];
  canReply: boolean;
  onReply: (parentId: string, content: string) => Promise<void>;
  submittingParentId?: string | null;
  emptyState?: React.ReactNode;
  currentAccountId?: string | null;
  productOwnerId?: string | null;
}

export const ModernQuestionThread: React.FC<ModernQuestionThreadProps> = ({
  nodes,
  canReply,
  onReply,
  submittingParentId,
  emptyState,
  currentAccountId,
  productOwnerId,
}) => {
  if (nodes.length === 0) {
    return emptyState ? <>{emptyState}</> : null;
  }

  return (
    <Stack
      spacing={2}
      sx={{
        width: '100%',
        marginTop: 3
      }}
    >
      {nodes.map((node) => (
        <QuestionNodeItem
          key={node.id}
          node={node}
          depth={0}
          canReply={canReply}
          onReply={onReply}
          submittingParentId={submittingParentId}
          currentAccountId={currentAccountId}
          productOwnerId={productOwnerId}
        />
      ))}
    </Stack>
  );
};

export default ModernQuestionThread;

