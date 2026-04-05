'use client';

export interface QuestionAuthor {
  id: string;
  name?: string;
  avatarUrl?: string;
  accountType?: string;
}

export interface AnswerNode {
  id: string;
  questionId: string;
  accountId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  author?: QuestionAuthor | null;
}

export interface QuestionNode {
  id: string;
  productId: string;
  accountId: string;
  content: string;
  parentQuestionId?: string | null;
  createdAt: string;
  updatedAt?: string;
  author?: QuestionAuthor | null;
  children: QuestionNode[];
  answers: AnswerNode[];
}

export interface QuestionsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  offset: number;
}

export interface QuestionsListResponse {
  items: QuestionNode[];
  pagination: QuestionsPagination;
}

export interface CreateQuestionPayload {
  productId: string;
  accountId: string;
  content: string;
  parentQuestionId?: string;
}

