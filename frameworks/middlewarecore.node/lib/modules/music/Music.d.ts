import { Describable, Indexable, IndexableCollection } from "../common";
export declare type Collections = "Samples";
export interface MusicCollection<T extends Collections> extends IndexableCollection<T> {
}
export declare type GNAlbumCoverSize = "LARGE" | "XLARGE" | "SMALL" | "MEDIUM" | "THUMBNAIL";
export interface SongDetails {
    albumPhotoUrl: string;
    popularity: number;
    previewUrl: string;
}
export interface ExternMetadata {
    source: string;
    track: Indexable;
    details?: SongDetails;
}
export interface ACRCloudOptions {
    host?: string;
    endpoint?: string;
    signature_version?: string;
    data_type?: string;
    secure?: boolean;
    access_key: string;
    access_secret: string;
}
export interface IdentifyRequest {
    customer: Indexable;
    device: Indexable;
    sampleUrl: string;
}
export interface UploadResult {
    result: string;
    url: string;
}
export interface SampleMetadata {
    album: Describable;
    artists: Array<Describable>;
    genres?: Array<Describable>;
    era?: Array<Describable>;
    name: string;
    date: Date;
    externMetadata?: ExternMetadata;
}
export interface Sample extends MusicCollection<"Samples"> {
    author: Indexable;
    createdAt: Date;
    sampleUri: string;
    identified: boolean;
    metadata?: SampleMetadata;
}
