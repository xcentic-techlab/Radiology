export function UploadToast() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <span className="text-sm text-gray-700">
        Uploading... This may take some time.
      </span>
    </div>
  );
}
