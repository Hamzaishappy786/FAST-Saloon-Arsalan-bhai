import { useState, useRef, useCallback } from 'react'
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Check, X } from 'lucide-react'

function getInitialCrop(width, height) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 80 }, 1, width, height),
    width,
    height
  )
}

function extractCroppedCanvas(imgEl, crop) {
  const scaleX = imgEl.naturalWidth / imgEl.width
  const scaleY = imgEl.naturalHeight / imgEl.height

  const pixelCrop = {
    x: (crop.x / 100) * imgEl.width * scaleX,
    y: (crop.y / 100) * imgEl.height * scaleY,
    width: (crop.width / 100) * imgEl.width * scaleX,
    height: (crop.height / 100) * imgEl.height * scaleY,
  }

  const OUTPUT = 200
  const canvas = document.createElement('canvas')
  canvas.width = OUTPUT
  canvas.height = OUTPUT
  const ctx = canvas.getContext('2d')

  // Clip to circle
  ctx.beginPath()
  ctx.arc(OUTPUT / 2, OUTPUT / 2, OUTPUT / 2, 0, Math.PI * 2)
  ctx.clip()

  ctx.drawImage(
    imgEl,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0, OUTPUT, OUTPUT
  )

  return canvas.toDataURL('image/jpeg', 0.85)
}

export function CropModal({ imageSrc, onSave, onCancel }) {
  const imgRef = useRef(null)
  const [crop, setCrop] = useState()
  const [completedCrop, setCompletedCrop] = useState()

  function onImageLoad(e) {
    const { width, height } = e.currentTarget
    setCrop(getInitialCrop(width, height))
  }

  function handleSave() {
    if (!imgRef.current || !completedCrop) return
    const dataUrl = extractCroppedCanvas(imgRef.current, completedCrop)
    onSave(dataUrl)
  }

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Crop Your Photo</DialogTitle>
          <p className="text-sm text-slate-400 mt-1">
            Drag and resize the circle to choose what to keep
          </p>
        </DialogHeader>

        {/* Crop area */}
        <div className="flex justify-center items-center bg-navy-900/60 rounded-xl overflow-hidden max-h-[60vh]">
          <ReactCrop
            crop={crop}
            onChange={(_, pct) => setCrop(pct)}
            onComplete={(_, pct) => setCompletedCrop(pct)}
            aspect={1}
            circularCrop
            keepSelection
            minWidth={20}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              onLoad={onImageLoad}
              alt="Crop preview"
              style={{ maxHeight: '55vh', maxWidth: '100%', display: 'block' }}
            />
          </ReactCrop>
        </div>

        {/* Preview of result */}
        {completedCrop && imgRef.current && (
          <div className="flex items-center gap-3 mt-1">
            <CropPreview imgEl={imgRef.current} crop={completedCrop} />
            <p className="text-xs text-slate-500">Preview of how it'll look</p>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="secondary" onClick={onCancel}>
            <X className="w-4 h-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!completedCrop}>
            <Check className="w-4 h-4" />
            Use This Photo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Small live preview circle
function CropPreview({ imgEl, crop }) {
  const SIZE = 56
  const scaleX = imgEl.naturalWidth / imgEl.width
  const scaleY = imgEl.naturalHeight / imgEl.height

  const cropPx = {
    x: (crop.x / 100) * imgEl.width * scaleX,
    y: (crop.y / 100) * imgEl.height * scaleY,
    w: (crop.width / 100) * imgEl.width * scaleX,
    h: (crop.height / 100) * imgEl.height * scaleY,
  }

  const scale = SIZE / cropPx.w

  return (
    <div
      style={{
        width: SIZE, height: SIZE,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid rgba(245,158,11,0.5)',
        flexShrink: 0,
        position: 'relative',
      }}
    >
      <img
        src={imgEl.src}
        alt="preview"
        style={{
          position: 'absolute',
          width: imgEl.naturalWidth * scale,
          height: imgEl.naturalHeight * scale,
          top: -cropPx.y * scale,
          left: -cropPx.x * scale,
          maxWidth: 'none',
        }}
      />
    </div>
  )
}
