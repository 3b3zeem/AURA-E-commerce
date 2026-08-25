'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  getBlogs,
  getBlogById,
  createBlogInDb,
  updateBlogInDb,
  deleteBlogInDb,
  getBlogCategoryObjects,
  createBlogCategoryInDb,
  deleteBlogCategoryInDb,
} from '@/lib/services/blogsService';
import { BlogPost, BlogCategory } from '@/types';

// ==========================================
// 1. BLOG POSTS QUERY & MUTATIONS
// ==========================================
export function useBlogPosts(category?: string, search?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDataChanged = () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    };
    window.addEventListener('aura_data_changed', handleDataChanged);

    const supabase = createClient();
    const channelId = `blogs_rt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blogs' }, () => {
        queryClient.invalidateQueries({ queryKey: ['blogs'] });
      })
      .subscribe();

    return () => {
      window.removeEventListener('aura_data_changed', handleDataChanged);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery<BlogPost[]>({
    queryKey: ['blogs', category || 'all', search || 'none'],
    queryFn: () => getBlogs(category, search),
    staleTime: 1000 * 30,
  });

  return { ...query, data: query.data || [] };
}

export function useSingleBlog(blogId: string) {
  const query = useQuery<BlogPost | null>({
    queryKey: ['blog', blogId],
    queryFn: () => getBlogById(blogId),
    enabled: Boolean(blogId),
    staleTime: 1000 * 30,
    refetchOnWindowFocus: false,
  });

  return { ...query, data: query.data || null };
}

export function useBlogPostMutations() {
  const queryClient = useQueryClient();

  const addBlogMutation = useMutation({
    mutationFn: (data: Partial<BlogPost>) => createBlogInDb(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });

  const updateBlogMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<BlogPost> }) =>
      updateBlogInDb(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });

  const deleteBlogMutation = useMutation({
    mutationFn: (id: string) => deleteBlogInDb(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blogs'] });
    },
  });

  return { addBlogMutation, updateBlogMutation, deleteBlogMutation };
}

// ==========================================
// 2. BLOG CATEGORIES QUERY & MUTATIONS
// ==========================================
export function useBlogCategories() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleDataChanged = () => {
      queryClient.invalidateQueries({ queryKey: ['blog_categories'] });
    };
    window.addEventListener('aura_data_changed', handleDataChanged);

    const supabase = createClient();
    const channelId = `blog_cats_rt_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_categories' }, () => {
        queryClient.invalidateQueries({ queryKey: ['blog_categories'] });
      })
      .subscribe();

    return () => {
      window.removeEventListener('aura_data_changed', handleDataChanged);
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const query = useQuery<BlogCategory[]>({
    queryKey: ['blog_categories'],
    queryFn: () => getBlogCategoryObjects(),
    staleTime: 1000 * 30,
  });

  const addCategoryMutation = useMutation({
    mutationFn: (name: string) => createBlogCategoryInDb(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog_categories'] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteBlogCategoryInDb(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog_categories'] });
    },
  });

  return {
    ...query,
    data: query.data || [],
    addCategoryMutation,
    deleteCategoryMutation,
  };
}
