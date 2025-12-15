/**
 * Gemral - Seed Content Services Index
 * Export all seed content related services
 */

// Core service for config, stats, management
export * from './seedContentService';
export { default as seedContentService } from './seedContentService';

// User generator
export * from './seedUserGenerator';
export { default as seedUserGenerator } from './seedUserGenerator';

// Post generator
export * from './seedPostGenerator';
export { default as seedPostGenerator } from './seedPostGenerator';

// Interaction generator (likes & comments)
export * from './seedInteractionGenerator';
export { default as seedInteractionGenerator } from './seedInteractionGenerator';

// Natural comment generator
export * from './naturalCommentGenerator';
export { default as naturalCommentGenerator } from './naturalCommentGenerator';

// AI Bot service
export * from './aiBotService';
export { default as aiBotService } from './aiBotService';

// Datasets (names, templates, etc.)
export * from './seedDatasets';
export { default as seedDatasets } from './seedDatasets';
