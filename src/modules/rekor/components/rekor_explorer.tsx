import { Alert, Box, CircularProgress, Pagination, Paper } from '@mui/material';
import { bind, Subscribe, SUSPENSE } from '@react-rxjs/core';
import { createSignal, suspend } from '@react-rxjs/utils';
import { useObservableSuspense } from 'observable-hooks';
import { Suspense } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import Highlight from 'react-highlight';
import { debounceTime, distinctUntilChanged, filter, startWith, switchMap, throttleTime } from 'rxjs/operators';
import { RekorIndexQuery, rekorRetrieve } from '../api/rekor';
import { RekorSearchForm } from './search_form';
import {load, dump} from 'js-yaml';
import { RekorSchema } from '../types/hashedrekord';
import { X509Certificate, PublicKey } from '@peculiar/x509';
import {Convert} from 'pvtsutils';

const [queryChange$, setQuery] = createSignal<RekorIndexQuery>();

const [useRekorIndexList, rekorIndexList$] = bind(
  queryChange$.pipe(
    throttleTime(200),
    switchMap(query => suspend(rekorRetrieve(query as RekorIndexQuery))),
    startWith(undefined),
  ))

function ErrorFallback({ error, resetErrorBoundary}: FallbackProps) {
  return (
    <Alert sx={{mt: 3}}  severity='error' variant='filled'>
      Something went wrong for query. Error code: {error?.message}
    </Alert>
  )
}

const DUMP_OPTIONS: jsyaml.DumpOptions = {
  replacer: (key, value) => {
    if (key === 'integratedTime') {
      return new Date(value * 1000);
    }
    if (key === 'verification') {
      return '<omitted>'
    }

    if (Convert.isBase64(value)) {
      try {
        return load(atob(value));
      } catch (e) {
        return value;
      }
    }
    return value;
  },
}

export function RekorList() {
  const rekorEntries = useRekorIndexList();

  if (!rekorEntries) {
    return <></>;
  }

  if (rekorEntries.entries.length === 0) {
    return <Alert sx={{mt: 3}} severity="info" variant="filled">No matching entries found</Alert>;
  }

  return (
    <>
      <Box sx={{mt: 2}}>
        Showing {rekorEntries.entries.length} of {rekorEntries?.totalCount}
      </Box>
      
      {
        rekorEntries.entries.map(entry => 
          <Highlight key={`${entry.key}-value`} className='yaml'>
            {dump(entry.content, DUMP_OPTIONS)}
          </Highlight>
        )
      }
    </>
  );
};

export function LoadingIndicator() {
  return (
    <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
          marginTop: 4,
        }}>
      <CircularProgress />
    </Box>
  );
}

export function RekorExplorer() {
  return (
      <div>
        <RekorSearchForm onSubmit={email => setQuery({email})} />
        
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingIndicator />}>
            <Subscribe source$={rekorIndexList$}>
              <RekorList></RekorList>
            </Subscribe>
          </Suspense>
        </ErrorBoundary>
      </div>
  );
}
