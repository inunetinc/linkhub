// API configuration for production/development
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper to build API endpoints
export const apiUrl = (path: string) => `${API_URL}${path}`;

// Helper for assets (images, etc.)
export const assetUrl = (path: string) => `${API_URL}${path}`;
