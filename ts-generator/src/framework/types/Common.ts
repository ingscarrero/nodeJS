
export interface IIndexable {
    [key: string]: any;
}

export const ERRORS = {
    NO_DATA_ERROR: "NO_DOCUMENTS",
    NO_MATCH_ERROR: "NO_MATCH_ERROR",
    MULTIPLE_DOCUMENTS: "MULTIPLE_DOCUMENTS",
    NOT_SUPPORTED: "NOT_SUPPORTED",
    VALIDATIONS_NOT_MET: "VALIDATIONS_NOT_MET"
};