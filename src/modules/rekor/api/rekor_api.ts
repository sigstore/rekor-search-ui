import {combineLatest, Observable, of} from 'rxjs';
import {fromFetch} from 'rxjs/fetch';
import {map, switchMap} from 'rxjs/operators';

export interface RekorIndexQuery {
  email?: string,
  artifact?: string,
  sha?: string,
}

export interface RekorEntry {
  key: string,
  content: unknown,
}

export interface RekorEntries {
  totalCount: number,
  entries: RekorEntry[],
}

function retrieveIndex(query: RekorIndexQuery): Observable<string[]> {
  return fromFetch('https://rekor.sigstore.dev/api/v1/index/retrieve', {
           method: 'POST',
           body: JSON.stringify(query),
           headers: {
             'Content-Type': 'application/json',
             'Accept': 'application/json',
           },
           selector: response => response.json(),
         })
      .pipe(map(response => {
        if (response.code) {
          throw new Error(`Failed to retrieve index: ${response.message}`);
        }
        return response;
      }));
}

function retrieveEntries(logIndex: string) {
  return fromFetch(
             `https://rekor.sigstore.dev/api/v1/log/entries/${logIndex}`, {
               headers: {
                 'Content-Type': 'application/json',
                 'Accept': 'application/json',
               },
               selector: response => response.json(),
             })
      .pipe(map(response => {
        if (response.code) {
          throw new Error(`Failed to retrieve entries: ${response.message}`);
        }
        return response;
      }));
}

export function rekorRetrieve(query: RekorIndexQuery): Observable<RekorEntries> {
  return retrieveIndex(query).pipe(
      map((logIndexes: string[]) => ({
          totalCount: logIndexes.length,
          indexes: logIndexes.slice(0, 20),
      })),
      switchMap(log => {
        if (log.indexes.length) {
          return combineLatest(
            log.indexes.map(logIndex => retrieveEntries(logIndex))).pipe(map(results => {
              return {
                totalCount: log.totalCount,
                entries: results.map(result => {
                  const [key, value] = Object.entries(result)[0];
                  return {
                    key,
                    content: value
                  };
                }),
              };
            }));
        }
        return of({totalCount: 0, entries: []});
      })
  );
}