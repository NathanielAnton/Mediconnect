/**
 * Generates a circular cropped PNG Blob from an image source.
 * @param {string} imageSrc - Data URL or object URL of the source image
 * @param {{ x: number, y: number, width: number, height: number }} pixelCrop - Crop area in pixels
 * @returns {Promise<Blob>} PNG blob with transparent background (circle shape)
 */
export default function getCroppedImg(imageSrc, pixelCrop) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => {
      const SIZE = 400;
      const canvas = document.createElement("canvas");
      canvas.width = SIZE;
      canvas.height = SIZE;
      const ctx = canvas.getContext("2d");

      // Clip to circle
      ctx.beginPath();
      ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      // Draw the cropped region scaled to 400x400
      ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        SIZE,
        SIZE
      );

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas toBlob failed"));
        }
      }, "image/png");
    });
    image.addEventListener("error", reject);
    image.src = imageSrc;
  });
}
