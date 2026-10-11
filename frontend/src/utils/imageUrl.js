export function getImageUrl(image) {
  if (!image) {
    return "";
  }

  if (image.startsWith("http")) {
    return image;
  }

  return `http://127.0.0.1:8000${image}`;
}