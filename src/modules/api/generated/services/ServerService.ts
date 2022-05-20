/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Error } from '../models/Error';
import type { RekorVersion } from '../models/RekorVersion';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ServerService {

    /**
     * Get the current version of the rekor server
     * @returns RekorVersion A JSON object with the running rekor version
     * @returns Error There was an internal error in the server while processing the request
     * @throws ApiError
     */
    public static getRekorVersion(): CancelablePromise<RekorVersion | Error> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/version',
        });
    }

}