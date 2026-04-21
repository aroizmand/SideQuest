-- SideQuest Migration 008: Storage Buckets
-- Run this in Supabase SQL Editor (storage operations)

-- ============================================================================
-- Create storage buckets
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('quest-covers', 'quest-covers', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Storage policies for avatars bucket
-- ============================================================================
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = auth.uid()::TEXT
);

-- ============================================================================
-- Storage policies for quest-covers bucket
-- ============================================================================
CREATE POLICY "Quest covers are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'quest-covers');

CREATE POLICY "Users can upload quest covers"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'quest-covers');

CREATE POLICY "Quest creators can update their covers"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'quest-covers');
