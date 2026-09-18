const isAbsoluteUrl = (value) =>
  /^(https?:|data:image\/|blob:)/i.test(value);

export function getMediaUrl(value) {
  if (!value) return null;

  const rawValue =
    typeof value === "string"
      ? value
      : value.file_url || value.file_path || value.url || value.file_key || "";
  const normalizedValue = rawValue.trim().replace(/&amp;/g, "&");

  if (!normalizedValue) return null;
  if (isAbsoluteUrl(normalizedValue)) return normalizedValue;

  const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;
  const api = new URL(apiUrl, window.location.origin);

  if (normalizedValue.startsWith("/")) {
    return `${api.origin}${normalizedValue}`;
  }

  const uploadsPath = normalizedValue.match(/(?:^|\/)(uploads\/.+)$/i)?.[1];
  if (uploadsPath) {
    return `${api.origin}/${uploadsPath}`;
  }

  return `${api.origin}/uploads/${normalizedValue.replace(/^\/+/, "")}`;
}

export function getEmployeeImageUrl(employee) {
  const photoDocument = (employee?.documents || employee?.employee_documents || []).find(
    (document) => {
      const type = document.document_type?.toUpperCase();
      return (
        type === "PHOTO" ||
        type === "PHOTO_FILE" ||
        type?.startsWith("PHOTO_") ||
        document.document_name?.toUpperCase() === "PHOTO" ||
        document.mime_type?.toLowerCase().startsWith("image/")
      );
    }
  );

  return getMediaUrl(
    photoDocument ||
      employee?.profile_image ||
      employee?.photo_url ||
      employee?.photo ||
      employee?.photo_file
  );
}
