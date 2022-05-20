/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type SearchIndex = {
    email?: string;
    publicKey?: {
        format: SearchIndex.format;
        content?: string;
        url?: string;
    };
    hash?: string;
};

export namespace SearchIndex {

    export enum format {
        PGP = 'pgp',
        X509 = 'x509',
        MINISIGN = 'minisign',
        SSH = 'ssh',
        TUF = 'tuf',
    }


}
