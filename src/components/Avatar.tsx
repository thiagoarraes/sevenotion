import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { Camera, User } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface AvatarProps {
  url: string | null | undefined;
  size: number;
  onUpload?: (url: string) => void;
}

export const Avatar: React.FC<AvatarProps> = ({ url, size, onUpload }) => {
  const { user } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (url) downloadImage(url);
    else setAvatarUrl(null);
  }, [url]);

  const downloadImage = async (path: string) => {
    try {
      const { data, error } = await supabase.storage.from('avatars').download(path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      setAvatarUrl(url);
    } catch (error) {
      console.error('Error downloading image: ', error);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!onUpload) return;
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user!.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;
      
      onUpload(filePath);
      toast.success('Avatar atualizado!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar avatar.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative" style={{ height: size, width: size }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="Avatar"
          className="rounded-full object-cover"
          style={{ height: size, width: size }}
        />
      ) : (
        <div 
          className="bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500"
          style={{ height: size, width: size }}
        >
          <User size={size / 2} />
        </div>
      )}
      {onUpload && (
        <>
          <label
            htmlFor="single"
            className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 cursor-pointer transition-all border-2 border-white dark:border-gray-800"
          >
            <Camera size={size * 0.2} />
          </label>
          <input
            style={{ visibility: 'hidden', position: 'absolute' }}
            type="file"
            id="single"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
          />
        </>
      )}
    </div>
  );
};
