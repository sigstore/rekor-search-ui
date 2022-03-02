import { SUSPENSE } from '@react-rxjs/core';
import { suspended } from '@react-rxjs/utils';
import { ObservableResource } from 'observable-hooks';
import {combineLatest, concat, Observable, of, Subject, throwError, zip} from 'rxjs';
import {fromFetch} from 'rxjs/fetch';
import {map, startWith, switchMap, tap} from 'rxjs/operators';

export interface RekorIndexQuery {
  email?: string,
}

function retrieveIndex(query: RekorIndexQuery) {
  return fromFetch('https://rekor.sigstore.dev/api/v1/index/retrieve', {
           method: 'POST',
           body: JSON.stringify(query),
           headers: {
             'Content-Type': 'application/json',
             'Accept': 'application/json',
           }
         })
      .pipe(switchMap(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(`Error: ${response.status}`);
        }
      }));
}

function retrieveEntries(logIndex: string) {
  return fromFetch(
             `https://rekor.sigstore.dev/api/v1/log/entries/${logIndex}`, {
               headers: {
                 'Content-Type': 'application/json',
                 'Accept': 'application/json',
               }
             })
      .pipe(switchMap(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Invalid response');
        }
      }));
}

export function rekorRetrieve(query: RekorIndexQuery): Observable<{}> {
  return retrieveIndex(query).pipe(
      switchMap(
          (logIndexes: string[]) => combineLatest(
              logIndexes.map(logIndex => retrieveEntries(logIndex)))),
      map(results => {
        return results.reduce((result, currentValue) => {
          return Object.assign(currentValue, result);
        }, {});
      }),
  );
}