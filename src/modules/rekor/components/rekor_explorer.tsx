import { Alert, Box, CircularProgress, Typography } from '@mui/material';
import { bind, Subscribe } from '@react-rxjs/core';
import { createSignal, suspend } from '@react-rxjs/utils';
import { dump, load } from 'js-yaml';
import { Convert } from 'pvtsutils';
import { Suspense } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import Highlight from 'react-highlight';
import { skip, startWith, switchMap, takeUntil, tap, throttleTime } from 'rxjs/operators';
import { RekorIndexQuery, rekorRetrieve } from '../api/rekor_api';
import { RekorSearchForm } from './search_form';
import {useDestroyed$} from '../../utils/rxjs';

const [queryChange$, setQuery] = createSignal<RekorIndexQuery>();

const [useRekorIndexList, rekorIndexList$] = bind(
  queryChange$.pipe(
    throttleTime(200),
    switchMap(query => suspend(rekorRetrieve(query as RekorIndexQuery))),
    startWith(undefined),
  ))

function ErrorFallback({error, resetErrorBoundary}: FallbackProps) {
  rekorIndexList$
      .pipe(
        // A value will always be returned on subscribe. Wait for a new search to take
        // place before resetting the error.
        skip(1),
        takeUntil(useDestroyed$()))
      .subscribe(resetErrorBoundary);
    
  return (
    <Alert sx={{mt: 3}}  severity='error' variant='filled'>
      {error?.message}
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
        return load(window.atob(value));
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
    return (
        <Alert sx={{mt: 3}} severity="info" variant="filled">
          No matching entries found
        </Alert>);
  }

  return (
    <>
      <Typography sx={{mt: 2}}>
        Showing {rekorEntries.entries.length} of {rekorEntries?.totalCount}
      </Typography>

      {
        rekorEntries.entries.map(entry => 
          <Highlight key={`${entry.key}`} className='yaml'>
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
        <RekorSearchForm onSubmit={query => setQuery(query)} />
        
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

