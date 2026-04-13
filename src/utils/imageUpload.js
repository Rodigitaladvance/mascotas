/**
 * Reads a File as a base64 data-URL and calls onLoad with the result.
 * No-ops silently when file is falsy.
 */
export const readImageAsDataURL = (file, onLoad) => {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => onLoad(ev.target.result);
  reader.readAsDataURL(file);
};
