export interface OEmbed {
  provider_url: string;
  cache_age: number;
  width: number;
  height: number;
  html: string;
  url: string;
  thumbnail_width: number;
  duration: number;
  version: string;
  title: string;
  provider_name: string;
  type: 'link' | 'UNSUPPORTED' | string;
  thumbnail_height: number;
  author_url: string;
  thumbnail_url: string;
  description: string;
  author_name: string;
}

export interface TileLink {
  text: string;
  url: string;
  oembed: OEmbed;
}

// Extended TileLink with ID for API responses
export interface TileLinkWithId extends TileLink {
  id: number;
}

export interface TileOptions {
  layout: 'standard' | string;
  links: TileLink[];
}

// Extended TileOptions with links that have IDs
export interface TileOptionsWithIds {
  layout: 'standard' | string;
  links: TileLinkWithId[];
}

export interface Tile {
  title: string;
  options: TileOptions;
  pushToAllHomeDashboards: boolean;
  items: any[]; // Can be more specific based on actual item structure
  type: 'links' | string;
  variant: 'custom' | string;
}

export interface LinkTilePayload {
  siteId: string;
  dashboardId: string;
  tile: Tile;
  isNewTiptap: boolean;
}

// Tile item structure from API response
export interface TileItem {
  text: string;
  url: string;
  oembed: OEmbed;
  id: number;
}

// Tile response result structure
export interface TileResponseResult {
  listOfItems: TileItem[];
  id: string;
  createdAt: string;
  isNewTiptap: boolean;
  options: TileOptionsWithIds;
}

// Complete API response wrapper
export interface LinkTileResponse {
  status: 'success' | 'error';
  result: TileResponseResult;
}

// App tile interface for tile management operations
export interface AppTile {
  tileInstanceName: string;
  instanceId?: string;
  contentTileId?: string;
}

// Tile API helpers interfaces
export type WaitOpts = {
  timeoutMs?: number;
  pollIntervalMs?: number;
};

export interface TileCreationResult {
  tileInstanceName: string;
  instanceId?: string;
  templateTileId?: string;
}

export interface TileCreationArgs {
  tileInstanceName: string;
  connectorId: string;
  baseId?: string;
  tableId?: string;
  baseName?: string;
}

// Additional utility types
export type TileType = 'links' | 'content' | 'feed' | 'custom';
export type TileVariant = 'custom' | 'standard' | 'compact';
export type TileLayout = 'standard' | 'grid' | 'list';
