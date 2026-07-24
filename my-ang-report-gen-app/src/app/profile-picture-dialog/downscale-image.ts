export async function downscaleImage(file: File, maxSize = 300): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (!e.target?.result) return reject('Failed to load file');
      img.src = e.target.result as string;
    };

    img.onload = () => {
      const scale = maxSize / Math.max(img.width, img.height);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject('Failed to downscale image');
      }, 'image/jpeg', 0.75);
    };

    reader.onerror = () => reject('FileReader error');
    reader.readAsDataURL(file);
  });
}
