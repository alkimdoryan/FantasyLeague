import React, { useState, useEffect, useRef } from 'react'

interface ImageWithFallbackProps {
  src: string
  fallbackSrc?: string
  alt: string
  className?: string
  onLoad?: () => void
  onError?: () => void
  lazy?: boolean
}

// Simple cache for loaded images
const imageCache = new Map<string, boolean>()

// Preload common images
const preloadImages = (urls: string[]) => {
  urls.forEach(url => {
    if (!imageCache.has(url)) {
      const img = new Image()
      img.onload = () => imageCache.set(url, true)
      img.onerror = () => imageCache.set(url, false)
      img.src = url
    }
  })
}

// Common team logos to preload (using actual file names)
const commonLogos = [
  '/api/data/club_logos/barcelonalogo.png',
  '/api/data/club_logos/realmadridlogo.png',
  '/api/data/club_logos/manchesterunitedlogo.png',
  '/api/data/club_logos/liverpoollogo.png',
  '/api/data/club_logos/fcbayernmunchenlogo.png',
  '/api/data/club_logos/parissaint-germainlogo.png',
  '/api/data/club_logos/juventuslogo.png',
  '/api/data/club_logos/acmilanlogo.png',
  '/api/data/club_logos/arsenallogo.png',
  '/api/data/club_logos/tottenhamhotspurlogo.png',
]

// Preload common images when component loads
preloadImages(commonLogos)

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = '/default-logo.png',
  alt,
  className = '',
  onLoad,
  onError,
  lazy = true,
}) => {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [inView, setInView] = useState(!lazy)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (lazy && imgRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
          }
        },
        { threshold: 0.1 }
      )
      observer.observe(imgRef.current)
      return () => observer.disconnect()
    }
  }, [lazy])

  useEffect(() => {
    setCurrentSrc(src)
    setHasError(false)
    setIsLoaded(false)
  }, [src])

  const handleLoad = () => {
    setIsLoaded(true)
    imageCache.set(currentSrc, true)
    onLoad?.()
  }

  const handleError = () => {
    if (currentSrc === src && fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(true)
      onError?.()
    }
  }

  const imgElement = inView ? (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      onLoad={handleLoad}
      onError={handleError}
    />
  ) : (
    <div
      ref={imgRef}
      className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}
    >
      <span className="text-gray-400 text-sm">Loading...</span>
    </div>
  )

  return imgElement
}

export default ImageWithFallback 

interface ImageWithFallbackProps {
  src: string
  fallbackSrc?: string
  alt: string
  className?: string
  onLoad?: () => void
  onError?: () => void
  lazy?: boolean
}

// Simple cache for loaded images
const imageCache = new Map<string, boolean>()

// Preload common images
const preloadImages = (urls: string[]) => {
  urls.forEach(url => {
    if (!imageCache.has(url)) {
      const img = new Image()
      img.onload = () => imageCache.set(url, true)
      img.onerror = () => imageCache.set(url, false)
      img.src = url
    }
  })
}

// Common team logos to preload (using actual file names)
const commonLogos = [
  '/api/data/club_logos/barcelonalogo.png',
  '/api/data/club_logos/realmadridlogo.png',
  '/api/data/club_logos/manchesterunitedlogo.png',
  '/api/data/club_logos/liverpoollogo.png',
  '/api/data/club_logos/fcbayernmunchenlogo.png',
  '/api/data/club_logos/parissaint-germainlogo.png',
  '/api/data/club_logos/juventuslogo.png',
  '/api/data/club_logos/acmilanlogo.png',
  '/api/data/club_logos/arsenallogo.png',
  '/api/data/club_logos/tottenhamhotspurlogo.png',
]

// Preload common images when component loads
preloadImages(commonLogos)

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = '/default-logo.png',
  alt,
  className = '',
  onLoad,
  onError,
  lazy = true,
}) => {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [inView, setInView] = useState(!lazy)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (lazy && imgRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
          }
        },
        { threshold: 0.1 }
      )
      observer.observe(imgRef.current)
      return () => observer.disconnect()
    }
  }, [lazy])

  useEffect(() => {
    setCurrentSrc(src)
    setHasError(false)
    setIsLoaded(false)
  }, [src])

  const handleLoad = () => {
    setIsLoaded(true)
    imageCache.set(currentSrc, true)
    onLoad?.()
  }

  const handleError = () => {
    if (currentSrc === src && fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(true)
      onError?.()
    }
  }

  const imgElement = inView ? (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      onLoad={handleLoad}
      onError={handleError}
    />
  ) : (
    <div
      ref={imgRef}
      className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}
    >
      <span className="text-gray-400 text-sm">Loading...</span>
    </div>
  )

  return imgElement
}

export default ImageWithFallback 

interface ImageWithFallbackProps {
  src: string
  fallbackSrc?: string
  alt: string
  className?: string
  onLoad?: () => void
  onError?: () => void
  lazy?: boolean
}

// Simple cache for loaded images
const imageCache = new Map<string, boolean>()

// Preload common images
const preloadImages = (urls: string[]) => {
  urls.forEach(url => {
    if (!imageCache.has(url)) {
      const img = new Image()
      img.onload = () => imageCache.set(url, true)
      img.onerror = () => imageCache.set(url, false)
      img.src = url
    }
  })
}

// Common team logos to preload (using actual file names)
const commonLogos = [
  '/api/data/club_logos/barcelonalogo.png',
  '/api/data/club_logos/realmadridlogo.png',
  '/api/data/club_logos/manchesterunitedlogo.png',
  '/api/data/club_logos/liverpoollogo.png',
  '/api/data/club_logos/fcbayernmunchenlogo.png',
  '/api/data/club_logos/parissaint-germainlogo.png',
  '/api/data/club_logos/juventuslogo.png',
  '/api/data/club_logos/acmilanlogo.png',
  '/api/data/club_logos/arsenallogo.png',
  '/api/data/club_logos/tottenhamhotspurlogo.png',
]

// Preload common images when component loads
preloadImages(commonLogos)

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = '/default-logo.png',
  alt,
  className = '',
  onLoad,
  onError,
  lazy = true,
}) => {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [inView, setInView] = useState(!lazy)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (lazy && imgRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
          }
        },
        { threshold: 0.1 }
      )
      observer.observe(imgRef.current)
      return () => observer.disconnect()
    }
  }, [lazy])

  useEffect(() => {
    setCurrentSrc(src)
    setHasError(false)
    setIsLoaded(false)
  }, [src])

  const handleLoad = () => {
    setIsLoaded(true)
    imageCache.set(currentSrc, true)
    onLoad?.()
  }

  const handleError = () => {
    if (currentSrc === src && fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(true)
      onError?.()
    }
  }

  const imgElement = inView ? (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      onLoad={handleLoad}
      onError={handleError}
    />
  ) : (
    <div
      ref={imgRef}
      className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}
    >
      <span className="text-gray-400 text-sm">Loading...</span>
    </div>
  )

  return imgElement
}

export default ImageWithFallback 

interface ImageWithFallbackProps {
  src: string
  fallbackSrc?: string
  alt: string
  className?: string
  onLoad?: () => void
  onError?: () => void
  lazy?: boolean
}

// Simple cache for loaded images
const imageCache = new Map<string, boolean>()

// Preload common images
const preloadImages = (urls: string[]) => {
  urls.forEach(url => {
    if (!imageCache.has(url)) {
      const img = new Image()
      img.onload = () => imageCache.set(url, true)
      img.onerror = () => imageCache.set(url, false)
      img.src = url
    }
  })
}

// Common team logos to preload (using actual file names)
const commonLogos = [
  '/api/data/club_logos/barcelonalogo.png',
  '/api/data/club_logos/realmadridlogo.png',
  '/api/data/club_logos/manchesterunitedlogo.png',
  '/api/data/club_logos/liverpoollogo.png',
  '/api/data/club_logos/fcbayernmunchenlogo.png',
  '/api/data/club_logos/parissaint-germainlogo.png',
  '/api/data/club_logos/juventuslogo.png',
  '/api/data/club_logos/acmilanlogo.png',
  '/api/data/club_logos/arsenallogo.png',
  '/api/data/club_logos/tottenhamhotspurlogo.png',
]

// Preload common images when component loads
preloadImages(commonLogos)

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  fallbackSrc = '/default-logo.png',
  alt,
  className = '',
  onLoad,
  onError,
  lazy = true,
}) => {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [inView, setInView] = useState(!lazy)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (lazy && imgRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setInView(true)
            observer.disconnect()
          }
        },
        { threshold: 0.1 }
      )
      observer.observe(imgRef.current)
      return () => observer.disconnect()
    }
  }, [lazy])

  useEffect(() => {
    setCurrentSrc(src)
    setHasError(false)
    setIsLoaded(false)
  }, [src])

  const handleLoad = () => {
    setIsLoaded(true)
    imageCache.set(currentSrc, true)
    onLoad?.()
  }

  const handleError = () => {
    if (currentSrc === src && fallbackSrc) {
      setCurrentSrc(fallbackSrc)
      setHasError(true)
      onError?.()
    }
  }

  const imgElement = inView ? (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      onLoad={handleLoad}
      onError={handleError}
    />
  ) : (
    <div
      ref={imgRef}
      className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}
    >
      <span className="text-gray-400 text-sm">Loading...</span>
    </div>
  )

  return imgElement
}

export default ImageWithFallback 