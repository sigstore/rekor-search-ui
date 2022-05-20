/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Error } from '../models/Error';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class PubkeyService {

    /**
     * Retrieve the public key that can be used to validate the signed tree head
     * Returns the public key that can be used to validate the signed tree head
     * @param treeId The tree ID of the tree you wish to get a public key for
     * @returns string The public key
     * @returns Error There was an internal error in the server while processing the request
     * @throws ApiError
     */
    public static getPublicKey(
        treeId?: string,
    ): CancelablePromise<string | Error> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/log/publicKey',
            query: {
                'treeID': treeId,
            },
        });
    }

}