/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ConsistencyProof } from '../models/ConsistencyProof';
import type { Error } from '../models/Error';
import type { LogInfo } from '../models/LogInfo';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TlogService {

    /**
     * Get information about the current state of the transparency log
     * Returns the current root hash and size of the merkle tree used to store the log entries.
     * @returns LogInfo A JSON object with the root hash and tree size as properties
     * @returns Error There was an internal error in the server while processing the request
     * @throws ApiError
     */
    public static getLogInfo(): CancelablePromise<LogInfo | Error> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/log',
        });
    }

    /**
     * Get information required to generate a consistency proof for the transparency log
     * Returns a list of hashes for specified tree sizes that can be used to confirm the consistency of the transparency log
     * @param lastSize The size of the tree that you wish to prove consistency to
     * @param firstSize The size of the tree that you wish to prove consistency from (1 means the beginning of the log) Defaults to 1 if not specified
     *
     * @param treeId The tree ID of the tree that you wish to prove consistency for
     * @returns ConsistencyProof All hashes required to compute the consistency proof
     * @returns Error There was an internal error in the server while processing the request
     * @throws ApiError
     */
    public static getLogProof(
        lastSize: number,
        firstSize: number = 1,
        treeId?: string,
    ): CancelablePromise<ConsistencyProof | Error> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/log/proof',
            query: {
                'firstSize': firstSize,
                'lastSize': lastSize,
                'treeID': treeId,
            },
            errors: {
                400: `The content supplied to the server was invalid`,
            },
        });
    }

}