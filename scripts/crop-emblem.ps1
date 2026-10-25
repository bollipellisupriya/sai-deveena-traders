Add-Type -AssemblyName System.Drawing

$srcPath = "d:\sai deevena\public\logo.png"
$destPath = "d:\sai deevena\public\logo-icon.png"

$src = [System.Drawing.Bitmap]::FromFile($srcPath)
Write-Host "Source image width: $($src.Width), height: $($src.Height)"

# Logo is 1024 x 341
# The emblem on the left starts at x=30 and ends at x=312.
# The letter 'S' of 'SAI' starts at x=325.
# So cropping x=25 to x=312 completely excludes the 'S'!
$cropX = 26
$cropY = 20
$cropW = 286
$cropH = 300

$size = 320
$dest = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($dest)
$g.Clear([System.Drawing.Color]::White)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$offsetX = [int](($size - $cropW) / 2)
$offsetY = [int](($size - $cropH) / 2)

$srcRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
$destRect = New-Object System.Drawing.Rectangle($offsetX, $offsetY, $cropW, $cropH)

$g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)

$g.Dispose()
$src.Dispose()

$dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
$dest.Dispose()

Write-Host "Successfully saved clean emblem to $destPath"
