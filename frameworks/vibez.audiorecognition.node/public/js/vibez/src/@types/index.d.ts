declare module vibez{
    export interface SampleMetadata{
        album: { id: string, name: string};
        artists: Array<{ id: string, name: string}>;
        genres: Array<{ id: string, name: string}>;
        spotify: { trackId: string };
        name: string;
        date: Date;
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
}
