export interface UploadResult{
    result: string;
    url: string;
}

export interface SampleMetadata{
    album: { name: string};
    artists: Array<{ name: string}>;
    genres?: Array<{ name: string}>;
    era?: Array<{ name: string}>;
    name: string;
    date: Date;
    spotify?: { trackId: string, popularity?: number, albumPhotoUrl?: string, preview_url?: string };
}
export interface SampleRecord{
    
    id: string;
    clubId: string;
    createdAt: Date;
    sampleUri: string;
    identified: boolean;
    metadata?: SampleMetadata;
    
}

export interface SongDetails {
    albumPhotoUrl: string;
    popularity: number;
    preview_url: string;
}

export interface IdentifyRequest {
    clubId: string;
    deviceId: string;
    sampleUrl: string;
}