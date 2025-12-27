import React from 'react';

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

  const initial = name?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="relative inline-block">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name || 'User'}
          className={`${sizeClasses[size]} rounded-full object-cover shadow-md`}
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

