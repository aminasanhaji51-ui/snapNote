// Réduit une photo avant l'envoi à l'IA : côté le plus long à 1280 px, JPEG qualité 0,8 (≈ 150–400 Ko).
// Retourne une data URL. Un ticket lisible reste lisible, et l'envoi est rapide sur mobile.
const MAX_SIDE = 1280

export async function resizeImage(file, maxSide = MAX_SIDE, quality = 0.8) {
  const canvas = await drawResized(file, maxSide)
  return canvas.toDataURL('image/jpeg', quality)
}

// Version à ranger dans le bucket : un peu plus grande (1600 px) pour rester lisible, retournée en Blob JPEG.
export async function resizeToBlob(file, maxSide = 1600, quality = 0.85) {
  const canvas = await drawResized(file, maxSide)
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Compression impossible.'))), 'image/jpeg', quality),
  )
}

async function drawResized(file, maxSide) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#fff' // fond blanc : un PNG transparent ne devient pas noir en JPEG
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
  return canvas
}
