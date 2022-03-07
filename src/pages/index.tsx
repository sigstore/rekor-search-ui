import { Box, Button, Card, CardActionArea, Container, CssBaseline, Divider, Grid, Paper, TextField, ThemeProvider, Typography } from '@mui/material';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../../styles/Home.module.sass';
import { RekorExplorer } from '../modules/rekor/components/rekor_explorer';
import { REKOR_SEARCH_THEME } from '../modules/theme/theme';


const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Rekor Search</title>
        <meta name="description" content="Search the Rekor public transparency log" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ThemeProvider theme={REKOR_SEARCH_THEME}>
        <Container
            sx={{
              mt: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 3
            }}>
          <Typography
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
              }}
              variant="h5"
              component="h1">
            <Image src="/rekor-logo.svg" alt="Rekor" width={124} height={40} />
            search
          </Typography>
          
          <RekorExplorer />

          <Box
              component="footer"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderTop: 2,
                borderColor: 'secondary.main',
              }}>
            <Card
                sx={{
                  mt: 3
                }}>
              <CardActionArea sx={{p: 1}}>
                <a href="https://chainguard.dev"
                  target="_blank"
                  rel="noopener noreferrer">
                  <Image src="/logo-full.svg" alt="Chainguard Logo" width={123} height={42} />
                </a>
              </CardActionArea>
            </Card>
          </Box>
        </Container>
      </ThemeProvider>
    </>
  )
}

export default Home
