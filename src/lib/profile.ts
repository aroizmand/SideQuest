import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface CreateProfileParams {
  session: Session;
  photoUri: string;
  firstName: string;
  age: number;
  gender: string;
}

export async function createUserProfile({ session, photoUri, firstName, age, gender }: CreateProfileParams): Promise<{ error: string | null }> {
  const userId = session.user.id;
  const ext = photoUri.split('.').pop() ?? 'jpg';
  const photoPath = `${userId}/profile.${ext}`;

  const formData = new FormData();
  formData.append('file', { uri: photoUri, name: `profile.${ext}`, type: `image/${ext}` } as any);

  const { error: uploadError } = await supabase.storage.from('avatars').upload(photoPath, formData, { upsert: true });
  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(photoPath);

  const { error: insertError } = await supabase.from('dim_user').insert({
    user_id: userId,
    first_name: firstName,
    photo_url: publicUrl,
    age,
    gender,
  });

  if (insertError) return { error: insertError.message };
  return { error: null };
}
