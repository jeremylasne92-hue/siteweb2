export type ResourceType = 'document' | 'video' | 'livre' | 'outil';

export interface MediaResource {
    id: string;
    resource_type: ResourceType;
    title: string;
    description: string;
    thumbnail_url?: string;
    external_url?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
    tags: string[];
    source?: string;
    author?: string;
    year?: number;
    is_featured: boolean;
    is_published: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export type MediaResourceCreate = Omit<MediaResource, 'id' | 'created_at' | 'updated_at'>;

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
    document: 'Documents',
    video: 'Vidéos',
    livre: 'Livres',
    outil: 'Outils',
};

export const RESOURCE_TYPE_COLORS: Record<ResourceType, { border: string; badge: string; text: string }> = {
    document: { border: 'border-l-emerald-500', badge: 'bg-emerald-500/10 text-emerald-400', text: 'text-emerald-400' },
    video: { border: 'border-l-amber-500', badge: 'bg-amber-500/10 text-amber-400', text: 'text-amber-400' },
    livre: { border: 'border-l-sky-500', badge: 'bg-sky-500/10 text-sky-400', text: 'text-sky-400' },
    outil: { border: 'border-l-violet-500', badge: 'bg-violet-500/10 text-violet-400', text: 'text-violet-400' },
};
