import React, { useState, useEffect } from 'react';
import { Skeleton } from 'antd';
import { useSignedUrl, needsSignedUrl } from '../../hooks/useSignedUrl';

export interface SecureImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  fallback?: React.ReactNode;
}

export const SecureImage: React.FC<SecureImageProps> = ({ src, fallback, style, className, ...props }) => {
  const { signedUrl, loading } = useSignedUrl(src);
  const [hasError, setHasError] = useState(false);
  const requiresSignedUrl = needsSignedUrl(src);

  useEffect(() => {
    setHasError(false);
  }, [src, signedUrl]);

  if (requiresSignedUrl && !signedUrl) {
    if (loading) {
      return (
        <div className={className} style={style}>
           <Skeleton.Image active style={{ width: '100%', height: '100%', minHeight: 100 }} />
        </div>
      );
    }
    return (
      fallback ?? (
        <div
          style={{ width: '100%', height: '100%', ...style }}
          className={`bg-slate-100 border border-slate-200 ${className || ''}`}
        />
      )
    );
  }

  if (hasError) {
    return (
      fallback ?? (
        <div
          style={{ width: '100%', height: '100%', ...style }}
          className={`bg-slate-100 border border-slate-200 ${className || ''}`}
        />
      )
    );
  }

  return (
    <img
      src={signedUrl || src}
      referrerPolicy="no-referrer"
      style={style}
      className={className}
      onError={(e) => {
        props.onError?.(e);
        setHasError(true);
      }}
      {...props}
    />
  );
};
