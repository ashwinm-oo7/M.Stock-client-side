// Custom hook to use the UserContext
export const compressBase64Image = async (
  base64String,
  maxWidth = 300,
  maxHeight = 300
) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;

      // Maintain aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = (maxHeight / maxWidth) * width;
          width = maxWidth;
        } else {
          width = (maxWidth / maxHeight) * height;
          height = maxHeight;
        }
      }

      // Draw the image on the canvas
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // Convert the canvas back to base64
      const compressedBase64 = canvas.toDataURL("image/jpeg", 0.8); // Adjust quality (0.8 = 80%)
      resolve(compressedBase64);
    };

    img.onerror = (error) => reject(error);
    img.src = base64String;
  });
};
