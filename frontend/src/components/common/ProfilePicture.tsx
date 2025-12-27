import React, { useState, useEffect } from 'react';

interface ProfilePictureProps {
  name?: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  status?: 'online' | 'offline';
}

export const ProfilePicture: React.FC<ProfilePictureProps> = ({
  name = '',
  imageUrl,
  size = 'md',
  showStatus = false,
  status = 'online',
}) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const statusSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5',
  };

  // Get initial from name (first character)
  const getInitial = () => {
    if (!name || name.trim() === '') return 'U';
    const firstChar = name.charAt(0);
    // If it's a number, show the number; otherwise uppercase the letter
    return isNaN(Number(firstChar)) ? firstChar.toUpperCase() : firstChar;
  };

  const initial = getInitial();

  // Reset error state when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      setImageError(false);
    }
  }, [imageUrl]);

  const handleImageError = () => {
    setImageError(true);
  };

  // Show image only if we have a valid imageUrl and no error
  const showImage = imageUrl && !imageError && imageUrl.trim() !== '';

  return (
    <div className="relative inline-block">
      {showImage ? (
        <img
          src={imageUrl}
          alt={name || 'User'}
          className={`${sizeClasses[size]} rounded-full object-cover shadow-md`}
          onError={handleImageError}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white font-semibold shadow-md`}
        >
          {initial}
        </div>
      )}
      {showStatus && (
        <div
          className={`absolute bottom-0 right-0 ${statusSizeClasses[size]} ${
            status === 'online' ? 'bg-green-500' : 'bg-gray-400'
          } rounded-full border-2 border-white`}
        ></div>
      )}
    </div>
  );
};

