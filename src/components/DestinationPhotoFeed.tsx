import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  Upload,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  X,
  Maximize2,
  RefreshCw,
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { DestinationPhoto } from '../types.ts';
import { fetchDestinationPhotos, uploadDestinationPhoto } from '../services/api.ts';

interface DestinationPhotoFeedProps {
  destinationId: string;
  destinationName: string;
}

export const DestinationPhotoFeed: React.FC<DestinationPhotoFeedProps> = ({
  destinationId,
  destinationName
}) => {
  const [photos, setPhotos] = useState<DestinationPhoto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Upload Form State
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Selected Photo for Lightbox Preview
  const [selectedPhoto, setSelectedPhoto] = useState<DestinationPhoto | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Allowed image MIME types & extensions
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

  // Fetch photos whenever destinationId changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setFetchError(null);
    setSuccessMessage(null);
    setFormError(null);
    setIsUploadOpen(false);

    fetchDestinationPhotos(destinationId)
      .then((data) => {
        if (isMounted) {
          // Sorting: Backend returns ORDER BY created_at DESC (newest -> oldest)
          setPhotos(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setFetchError(err.message || 'Failed to load destination photos');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [destinationId]);

  // Handle file selection with validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      setFormError('Invalid image format. Only JPG, JPEG, PNG, and WEBP images are accepted.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 2. File size validation (5MB max)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setFormError('File size exceeds the 5MB limit. Please choose a smaller photo.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // 3. Read as Data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setFileDataUrl(result);
      setFileName(file.name);
    };
    reader.onerror = () => {
      setFormError('Failed to read image file. Please try another file.');
    };
    reader.readAsDataURL(file);
  };

  // Submit Photo Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const targetPhotoUrl = uploadMode === 'file' ? fileDataUrl : urlInput.trim();

    if (!targetPhotoUrl) {
      setFormError('Please select an image file or provide a valid image URL.');
      return;
    }

    // Additional URL validation if using URL mode
    if (uploadMode === 'url') {
      const lower = targetPhotoUrl.toLowerCase();
      const disallowed = ['.exe', '.sh', '.bat', '.cmd', '.js', '.ts', '.html', '.php', '.py', '.zip', '.pdf'];
      if (disallowed.some((ext) => lower.includes(ext))) {
        setFormError('Executable or non-image files are strictly prohibited.');
        return;
      }
      if (!targetPhotoUrl.startsWith('http://') && !targetPhotoUrl.startsWith('https://')) {
        setFormError('Please enter a valid HTTP or HTTPS image URL.');
        return;
      }
    }

    setIsUploading(true);

    try {
      // Send photo to backend (upload date and time are generated automatically by the server)
      const res = await uploadDestinationPhoto(destinationId, {
        photo_url: targetPhotoUrl,
        caption: caption.trim(),
        user_id: 'usr_ar_8932',
        user_name: 'Explorer (You)'
      });

      if (res.success && res.photo) {
        // Automatic Real-Time Sorting: Newly uploaded photo automatically appears at the top (newest first)
        setPhotos((prev) => [res.photo, ...prev]);
        setSuccessMessage('Photo uploaded successfully! Your photo now appears at the top of the feed.');
        
        // Reset form
        setFileDataUrl('');
        setFileName('');
        setUrlInput('');
        setCaption('');
        if (fileInputRef.current) fileInputRef.current.value = '';

        // Auto close upload form after brief moment
        setTimeout(() => {
          setIsUploadOpen(false);
          setSuccessMessage(null);
        }, 2000);
      }
    } catch (err: any) {
      setFormError(err.message || 'Upload failed. Please check your connection and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Format ISO timestamp to readable date and time
  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;

      const datePart = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
      const timePart = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      return `${datePart} • ${timePart}`;
    } catch {
      return isoString;
    }
  };

  return (
    <div id="destination-photo-feed-container" className="rounded-xl border border-slate-800/80 bg-slate-950 p-4 sm:p-5 mt-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-950 border border-indigo-800/60 text-indigo-400">
              <Camera className="h-3.5 w-3.5" />
            </span>
            <h3 className="font-['Outfit'] text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              LATEST PHOTOS • {destinationName.toUpperCase()}
            </h3>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Automatic date-wise photo feed sorted newest to oldest. Uploads include server-verified timestamps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="btn-upload-destination-photo"
            onClick={() => {
              setIsUploadOpen(!isUploadOpen);
              setFormError(null);
              setSuccessMessage(null);
            }}
            className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-900/20"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>{isUploadOpen ? 'Close Upload' : 'Upload Photo'}</span>
          </button>
        </div>
      </div>

      {/* Photo Upload Form Panel */}
      {isUploadOpen && (
        <form
          id="destination-photo-upload-form"
          onSubmit={handleUploadSubmit}
          className="rounded-lg border border-indigo-900/50 bg-[#121212] p-4 mb-5 space-y-3.5"
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
            <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Upload Destination Photo for {destinationName}
            </span>
            <div className="flex items-center gap-1 rounded bg-slate-900 border border-slate-800 p-0.5 text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setUploadMode('file');
                  setFormError(null);
                }}
                className={`px-2 py-0.5 rounded transition ${
                  uploadMode === 'file' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Local File
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMode('url');
                  setFormError(null);
                }}
                className={`px-2 py-0.5 rounded transition ${
                  uploadMode === 'url' ? 'bg-indigo-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Image URL
              </button>
            </div>
          </div>

          {/* Form Errors & Alerts */}
          {formError && (
            <div className="flex items-start gap-2 rounded-md border border-rose-500/30 bg-rose-950/20 p-2.5 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-950/20 p-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Upload Method: File Drag / Picker */}
          {uploadMode === 'file' ? (
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Select Photo (JPG, JPEG, PNG, WEBP • Max 5MB)
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-4 cursor-pointer hover:border-indigo-500/60 hover:bg-slate-900/70 transition"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  id="destination-photo-file-input"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Camera className="h-6 w-6 text-slate-500 mb-1" />
                <span className="text-xs text-slate-300 font-medium">
                  {fileName ? fileName : 'Click or tap to choose photo'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  Formats: JPG, JPEG, PNG, WEBP (Max 5MB)
                </span>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1.5">
                Direct Image URL
              </label>
              <input
                type="url"
                id="destination-photo-url-input"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/... or secure image link"
                className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}

          {/* Photo Preview if loaded */}
          {(fileDataUrl || (uploadMode === 'url' && urlInput.trim())) && (
            <div className="relative h-32 w-full sm:w-48 rounded-lg overflow-hidden border border-slate-800 bg-black">
              <img
                src={uploadMode === 'file' ? fileDataUrl : urlInput.trim()}
                alt="Upload preview"
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover"
                onError={() => {
                  if (uploadMode === 'url') {
                    setFormError('Unable to load image from provided URL. Please check the address.');
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setFileDataUrl('');
                  setFileName('');
                  setUrlInput('');
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="absolute top-1.5 right-1.5 rounded-full bg-black/80 p-1 text-slate-300 hover:text-white"
                title="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Optional Caption */}
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1.5">
              Caption (Optional)
            </label>
            <input
              type="text"
              id="destination-photo-caption-input"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="e.g. Sunset view over the shoreline, peaceful morning light..."
              maxLength={300}
              className="w-full rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Server Timestamp Information Note */}
          <div className="rounded border border-slate-800/80 bg-slate-900/40 px-3 py-2 text-[10px] text-slate-400 flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-indigo-400 shrink-0" />
            <span>
              Upload date and time are generated automatically by the server upon submission to ensure tamper-proof chronological ordering.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => setIsUploadOpen(false)}
              className="rounded-md border border-slate-800 bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-destination-photo"
              disabled={isUploading || (uploadMode === 'file' && !fileDataUrl) || (uploadMode === 'url' && !urlInput.trim())}
              className="rounded-md bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md shadow-indigo-900/20 flex items-center gap-1.5"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  <span>Submit Photo</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Network / Fetch Error State */}
      {fetchError && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-950/20 p-4 text-center">
          <AlertCircle className="mx-auto h-6 w-6 text-rose-400 mb-1.5" />
          <p className="text-xs text-rose-300 font-medium">{fetchError}</p>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setFetchError(null);
              fetchDestinationPhotos(destinationId)
                .then((data) => {
                  setPhotos(data);
                  setIsLoading(false);
                })
                .catch((err) => {
                  setFetchError(err.message || 'Failed to load destination photos');
                  setIsLoading(false);
                });
            }}
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300 hover:text-white"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && !fetchError && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-xl border border-slate-800 bg-[#121212] overflow-hidden animate-pulse">
              <div className="aspect-[4/3] bg-slate-900" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-2/3 rounded bg-slate-800" />
                <div className="h-2.5 w-1/2 rounded bg-slate-900" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State: EXACT REQUIREMENT 12 */}
      {!isLoading && !fetchError && photos.length === 0 && (
        <div
          id="destination-photos-empty-state"
          className="rounded-xl border border-slate-800/80 bg-[#121212] p-8 text-center"
        >
          <Camera className="mx-auto h-9 w-9 text-slate-600 mb-2.5" />
          <h4 className="font-['Outfit'] text-xs sm:text-sm font-bold text-slate-300">
            No photos uploaded for this destination yet.
          </h4>
          <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
            Be the first traveler to share authentic live moments from {destinationName}. Upload a photo to begin the feed.
          </p>
          <button
            type="button"
            onClick={() => {
              setIsUploadOpen(true);
              setFormError(null);
            }}
            className="mt-3.5 inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-500 transition shadow-md shadow-indigo-900/20"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload First Photo</span>
          </button>
        </div>
      )}

      {/* Photos Feed: Chronologically Sorted by Backend (Newest First) */}
      {!isLoading && !fetchError && photos.length > 0 && (
        <div
          id="destination-photos-grid"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5"
        >
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              id={`photo-card-${photo.id}`}
              className="group relative rounded-xl border border-slate-800/80 bg-[#121212] overflow-hidden hover:border-slate-700 transition flex flex-col justify-between shadow-md"
            >
              {/* Photo Image Container */}
              <div
                onClick={() => setSelectedPhoto(photo)}
                className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900 cursor-pointer"
              >
                <img
                  src={photo.photo_url}
                  alt={photo.caption || `${destinationName} photo`}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-black/40 opacity-70 group-hover:opacity-50 transition-opacity" />

                {/* Newest Tag for the 1st photo */}
                {idx === 0 && (
                  <div className="absolute top-2.5 left-2.5">
                    <span className="flex items-center gap-1 rounded bg-indigo-950/90 border border-indigo-700/60 px-2 py-0.5 text-[9px] font-bold text-indigo-300 backdrop-blur-md">
                      <Sparkles className="h-2.5 w-2.5 text-indigo-400" />
                      LATEST UPLOAD
                    </span>
                  </div>
                )}

                {/* Enlarge Icon on hover */}
                <div className="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 border border-slate-700 text-white backdrop-blur-sm">
                    <Maximize2 className="h-3.5 w-3.5" />
                  </span>
                </div>

                {/* Upload Timestamp Overlay on Image */}
                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[10px] font-medium text-slate-200 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/10">
                    <Calendar className="h-3 w-3 text-indigo-400" />
                    {formatDateTime(photo.created_at)}
                  </span>
                </div>
              </div>

              {/* Photo Card Body Details */}
              <div className="p-3 flex-1 flex flex-col justify-between">
                <div>
                  {photo.caption ? (
                    <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                      {photo.caption}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      No caption provided
                    </p>
                  )}
                </div>

                {/* Card Footer: Uploader Profile & Destination Tag */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
                      <User className="h-2.5 w-2.5" />
                    </span>
                    <span className="truncate font-medium text-slate-300">
                      {photo.user_name || 'Apna Route Traveler'}
                    </span>
                  </div>
                  <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-mono text-indigo-400 shrink-0 border border-slate-800">
                    {destinationName}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal for Enlarge View */}
      {selectedPhoto && (
        <div
          id="photo-feed-lightbox-modal"
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full rounded-xl border border-slate-800 bg-[#121212] overflow-hidden shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-slate-400 hover:text-white border border-slate-700 transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="max-h-[70vh] bg-black flex items-center justify-center">
              <img
                src={selectedPhoto.photo_url}
                alt={selectedPhoto.caption || `${destinationName} photo`}
                referrerPolicy="no-referrer"
                className="max-h-[70vh] w-auto object-contain"
              />
            </div>

            <div className="p-4 sm:p-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#121212]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="rounded bg-indigo-950 border border-indigo-800 px-2 py-0.5 text-[10px] font-bold text-indigo-300 uppercase">
                    {destinationName}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="h-3 w-3 text-indigo-400" />
                    Uploaded: {formatDateTime(selectedPhoto.created_at)}
                  </span>
                </div>
                {selectedPhoto.caption && (
                  <p className="text-xs sm:text-sm text-slate-200 mt-1">{selectedPhoto.caption}</p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                  <User className="h-3.5 w-3.5" />
                </span>
                <div className="text-left">
                  <span className="text-xs font-semibold text-white block">
                    {selectedPhoto.user_name || 'Apna Route Explorer'}
                  </span>
                  <span className="text-[10px] text-slate-500 block">Verified Community Contributor</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
