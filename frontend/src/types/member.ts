export type ProjectType = 'cognisphere' | 'echolink' | 'scenariste' | 'benevole';
export type ExperienceLevel = 'professional' | 'student' | 'self_taught' | 'motivated';
export type Availability = 'punctual' | 'regular' | 'active';

export type SocialPlatform =
    | 'website' | 'instagram' | 'linkedin' | 'tiktok' | 'facebook'
    | 'twitter' | 'youtube' | 'github' | 'behance' | 'vimeo' | 'other';

export interface SocialLink {
    platform: SocialPlatform;
    url: string;
    label?: string;
}

export interface MemberProfile {
    id: string;
    display_name: string;
    slug: string;
    bio?: string;
    avatar_url?: string;
    city?: string;
    region?: string;
    project: ProjectType;
    role_title?: string;
    skills: string[];
    experience_level?: ExperienceLevel;
    availability?: Availability;
    contact_email?: string;
    social_links: SocialLink[];
    joined_at: string;
    membership_status: string;
}
