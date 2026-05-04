import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';
import React from 'react';

const ImageUpload = ({ value, onChange, className }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value || null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleFile = async (file) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    setError('');
    setUploading(true);

    // Local preview
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        formData
      );

      const cloudinaryUrl = res.data.secure_url;

      setPreview(cloudinaryUrl);
      onChange(cloudinaryUrl);
    } catch (err) {
      console.error(err);
      setError('Upload failed');
      onChange(localUrl);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setPreview(null);
    onChange('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'relative rounded-xl border-2 border-dashed transition-all cursor-pointer group',
          preview
            ? 'border-transparent'
            : 'border-white/10 hover:border-indigo-500/40 bg-white/3 hover:bg-indigo-500/5'
        )}
        onClick={() => !preview && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {preview ? (
          <div className="relative rounded-xl overflow-hidden">
            <img src={preview} alt="Preview" className="w-full h-48 object-cover" />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/80 text-white text-sm hover:bg-red-500"
              >
                <X size={14} /> Remove
              </button>
            </div>

            {uploading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 size={20} className="text-white animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
            {uploading ? (
              <Loader2 size={24} className="text-indigo-400 animate-spin mb-3" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 group-hover:bg-indigo-500/20 transition-colors">
                <Upload size={20} className="text-indigo-400" />
              </div>
            )}

            <p className="text-sm font-medium text-white/70 mb-1">
              {uploading ? 'Uploading...' : 'Click or drag & drop'}
            </p>
            <p className="text-xs text-white/30">JPG, PNG, WebP • Max 5MB</p>
          </div>
        )}
      </div>

      {!preview && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      )}

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
};

export default ImageUpload;
