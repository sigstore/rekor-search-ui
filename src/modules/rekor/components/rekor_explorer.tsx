import { CircularProgress } from '@mui/material';
import { bind, Subscribe, SUSPENSE } from '@react-rxjs/core';
import { createSignal, suspend } from '@react-rxjs/utils';
import { useObservableSuspense } from 'observable-hooks';
import { Suspense } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import Highlight from 'react-highlight';
import { distinctUntilChanged, filter, startWith, switchMap } from 'rxjs/operators';
import { RekorIndexQuery, rekorRetrieve } from '../rekor_api';
import { RekorSearchForm } from './rekor_search_form';
import {load, dump} from 'js-yaml';
import { RekorSchema } from '../types/hashedrekord';
import { X509Certificate, PublicKey } from '@peculiar/x509';

const [queryChange$, setQuery] = createSignal<RekorIndexQuery>();

const [useRekorIndexList, rekorIndexList$] = bind(
  queryChange$.pipe(
    distinctUntilChanged((prev, curr) => prev.email === curr.email),
    switchMap(query => suspend(rekorRetrieve(query as RekorIndexQuery))),
    startWith(undefined),
  ))

function ErrorFallback({ error, resetErrorBoundary}: FallbackProps) {
  return (
    <div>
      <p>Something went wrong:</p>
      <pre>{error?.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

interface SpecOf<T> {
  spec: T,
}

interface Rekord {
  key: string,
  value: object,
  body: SpecOf<RekorSchema>,
  publicKey?: X509Certificate,
}

function toListRekord(entries: object|undefined): Rekord[] {
  return Object.entries(entries ?? {}).map(([key, value]) => {
    const body = load(window.atob(value['body'])) as SpecOf<RekorSchema>;

    return {
      key,
      value,
      body: body,
      publicKey: new X509Certificate(atob(body.spec.signature.publicKey?.content!))
    };
  });
}

export function RekorList() {
  const rekorEntries = toListRekord(useRekorIndexList());

  return (
    <>
      <link rel="stylesheet" href="/monokai-sublime.css"></link>
      {rekorEntries.map(rekord => 
        <>
          <Highlight key={`${rekord.key}-value`} className='yaml'>
            {dump(rekord.value)}
          </Highlight>
          <Highlight key={`${rekord.key}-body`} className='yaml'>
            {dump(rekord.body)}
          </Highlight>
          <Highlight key={`${rekord.key}-publickey`} className='yaml'>
            {/* {rekord.publicKey?.issuer} */}
            {rekord.publicKey?.issuerName.toString()}
          </Highlight>
        </>
      )}
    </>
  );
};

export function RekorExplorer() {
  return (
      <div>
        <RekorSearchForm onSubmit={email => setQuery({email})} />
        
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<CircularProgress />}>
            <Subscribe source$={rekorIndexList$}>
              <RekorList></RekorList>
            </Subscribe>
          </Suspense>
        </ErrorBoundary>
      </div>
  );
}
