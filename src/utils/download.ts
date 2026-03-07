/**
 * Download Utilities
 * Helper functions for download operations
 */

export function isValidYouTubeUrl(url: string): boolean {
  const youtubeUrlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
  return youtubeUrlPattern.test(url.trim())
}

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

export function parseUrlList(input: string): string[] {
  return input
    .split(/[,\n]+/)
    .map((url) => url.trim())
    .filter((url) => url.length > 0 && isValidYouTubeUrl(url))
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"

  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

export function formatDuration(seconds: number): string {
  if (seconds === 0) return "0s"

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const parts = []
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`)

  return parts.join(" ")
}

/**
 * Validate a list of URLs
 */
export function validateUrlList(urls: string[]): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (urls.length === 0) {
    errors.push("No URLs provided")
  }

  urls.forEach((url, index) => {
    if (!isValidYouTubeUrl(url)) {
      errors.push(`URL ${index + 1} is not a valid YouTube URL`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Get download filename from video title
 */
export function sanitizeFilename(filename: string, maxSize:
number = 255): string {
  return filename
      .replace(/[^\w\s.-]/gu, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxSize);
}

