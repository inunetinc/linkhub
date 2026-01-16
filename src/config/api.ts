// API Configuration
// Use environment variable in production, fallback to localhost for development
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to construct API URLs
export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

// Helper for assets (images, etc.)
export const assetUrl = (path: string) => `${API_BASE_URL}${path}`;
