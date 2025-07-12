// Image management utilities based on findimage.md
import React from 'react';

/**
 * Utility functions for handling images in the football fantasy app
 */

/**
 * Convert string to ASCII-safe format for file names
 * Removes special characters and converts to lowercase
 * Special handling for specific team names
 */
export const toAsciiSafe = (str: string): string => {
  // Special cases for teams with known logo file names
  const specialCases: { [key: string]: string } = {
    'Paris Saint-Germain': 'parissaint-germain',
    'Real Betis': 'realbetis',
    'Atlético Madrid': 'atleticomadrid',
    'AC Milan': 'acmilan',
    'Inter Milan': 'intermilan',
    'Borussia Dortmund': 'borussiadortmund'
  }

  if (specialCases[str]) {
    return specialCases[str]
  }

  return str
    .normalize('NFD') // Normalize to decomposed form
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric characters
    .trim()
}

/**
 * Get player image path using API endpoint
 * @param playerName - Player's full name
 * @returns API endpoint URL for player image
 */
export const getPlayerImagePath = (playerName: string): string => {
  const asciiName = toAsciiSafe(playerName)
  return `/api/data/player_images/${asciiName}player.png`
}

/**
 * Get team logo path using API endpoint
 * @param teamName - Team name
 * @returns API endpoint URL for team logo
 */
export const getTeamLogoPath = (teamName: string): string => {
  const asciiName = toAsciiSafe(teamName)
  return `/api/data/club_logos/${asciiName}logo.png`
}

/**
 * Preload critical images for better performance
 * Using real team names from database
 */
export const preloadCriticalImages = () => {
  const criticalImages = [
    '/api/data/club_logos/arsenallogo.png',
    '/api/data/club_logos/chelsealogo.png',
    '/api/data/club_logos/fcbayernmunchenlogo.png',
    '/api/data/club_logos/liverpoollogo.png',
    '/api/data/club_logos/manchestercitylogo.png',
    '/api/data/club_logos/manchesterunitedlogo.png',
    '/api/data/club_logos/parissaint-germainlogo.png',
    '/api/data/club_logos/realmadridlogo.png',
    '/api/data/club_logos/tottenhamhotspurlogo.png',
    '/api/data/club_logos/fcbarcelonalogo.png',
    '/api/data/club_logos/acmilanlogo.png',
    '/api/data/club_logos/intermilanlogo.png',
    '/api/data/club_logos/juventuslogo.png',
    '/api/data/club_logos/borussiadortmundlogo.png',
    '/api/data/club_logos/atleticomadridlogo.png',
  ]

  // Preload in batches to avoid overwhelming the server
  const batchSize = 5
  for (let i = 0; i < criticalImages.length; i += batchSize) {
    const batch = criticalImages.slice(i, i + batchSize)
    setTimeout(() => {
      batch.forEach(url => {
        const img = new Image()
        img.src = url
      })
    }, i * 100) // Stagger the batches
  }
}

/**
 * Safe base64 encoding for SVG strings
 */
const safeBase64Encode = (str: string): string => {
  // Clean the string first
  const cleanStr = str.replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
  try {
    return btoa(cleanStr)
  } catch (error) {
    console.warn('Base64 encoding failed, using fallback')
    return ''
  }
}

/**
 * Default fallback images as data URIs for instant loading
 */
export const defaultImages = {
  playerPlaceholder: `data:image/svg+xml;base64,${safeBase64Encode(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f0f0f0"/><circle cx="50" cy="35" r="15" fill="#ddd"/><path d="M20 80 Q50 60 80 80 L80 100 L20 100 Z" fill="#ddd"/><text x="50" y="95" text-anchor="middle" font-size="8" fill="#999">Player</text></svg>`)}`,
  teamPlaceholder: `data:image/svg+xml;base64,${safeBase64Encode(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/><circle cx="50" cy="50" r="30" fill="none" stroke="#dee2e6" stroke-width="2"/><text x="50" y="55" text-anchor="middle" font-size="10" fill="#6c757d">Team</text></svg>`)}`,
  placeholder: `data:image/svg+xml;base64,${safeBase64Encode(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="#f8f9fa" stroke="#dee2e6" stroke-width="1"/><text x="50" y="55" text-anchor="middle" font-size="12" fill="#6c757d">Image</text></svg>`)}`
}

/**
 * Check if an image URL is likely to exist based on common patterns
 */
export const isLikelyValidImage = (url: string): boolean => {
  // Check for common image extensions
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
  const hasValidExtension = imageExtensions.some(ext => url.toLowerCase().includes(ext))
  
  // Check for data URIs
  const isDataUri = url.startsWith('data:image/')
  
  return hasValidExtension || isDataUri
}

/**
 * Position icons for different player positions
 */
export const positionIcons = {
  'G': '🥅', // Goalkeeper
  'D': '🛡️', // Defense  
  'M': '⚽', // Midfield
  'F': '🔥'  // Forward
};

/**
 * Get position icon
 * @param position - Player position (G, D, M, F)
 * @returns Position icon
 */
export function getPositionIcon(position: string): string {
  const pos = position.toUpperCase();
  return positionIcons[pos as keyof typeof positionIcons] || '⚽';
}

/**
 * Image error handler for React components
 * @param e - React error event
 * @param fallbackSrc - Fallback image source
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement>, fallbackSrc: string): void {
  const target = e.target as HTMLImageElement;
  if (target.src !== fallbackSrc) {
    target.src = fallbackSrc;
  }
}

/**
 * Preload important images for better performance
 */
export function preloadImages(imagePaths: string[]): void {
  imagePaths.forEach(path => {
    const img = new Image();
    img.src = path;
  });
}

/**
 * Preload common team logos and player images
 */
export function preloadCommonImages(): void {
  const commonTeams = [
    'bocajuniors', 'riverplate', 'huracan', 'realmadrid', 'barcelona', 
    'manchesterunited', 'liverpool', 'arsenal', 'chelsea', 'tottenham'
  ];
  
  const teamLogos = commonTeams.map(team => `/data/club_logos/${team}logo.png`);
  
  // Preload in small batches to avoid overwhelming the browser
  setTimeout(() => preloadImages(teamLogos.slice(0, 5)), 1000);
  setTimeout(() => preloadImages(teamLogos.slice(5, 10)), 2000);
}

/**
 * Test function for ASCII conversion - for debugging
 */
export function testImagePaths(): void {
  const testPlayers = ["Pablo Pérez", "Rodrigo Gómez", "Nacho Fernández"];
  const testTeams = ["Boca Juniors", "River Plate", "Huracán"];
  
  console.log("=== Testing Player Image Paths ===");
  testPlayers.forEach(player => {
    const path = getPlayerImagePath(player);
    console.log(`${player} → ${path}`);
  });
  
  console.log("=== Testing Team Logo Paths ===");
  testTeams.forEach(team => {
    const path = getTeamLogoPath(team);
    console.log(`${team} → ${path}`);
  });
}

// Add to window for browser console testing
if (typeof window !== 'undefined') {
  (window as any).testImagePaths = testImagePaths;
  (window as any).convertToAscii = toAsciiSafe;
  (window as any).getPlayerImagePath = getPlayerImagePath;
  (window as any).getTeamLogoPath = getTeamLogoPath;
  (window as any).preloadCommonImages = preloadCommonImages;
  
  // Auto-start preloading after page load
  window.addEventListener('load', () => {
    setTimeout(preloadCommonImages, 3000);
  });
} 
 