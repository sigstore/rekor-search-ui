import { Button, Container, Divider, Grid, TextField, Typography } from '@mui/material';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../../styles/Home.module.sass';
import { RekorExplorer } from '../modules/rekor/components/rekor_explorer';


const Home: NextPage = () => {
  return (
    <div className={styles.layout}>
      <Head>
        <title>Rekor Search</title>
        <meta name="description" content="Search the Rekor public transparency log" />
        <link rel="icon" href="/favicon.ico" />

      </Head>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" />
      <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />

      <Container component="main">
        <Typography variant="h4" component="h1" className={styles.title}>
          Rekor Search
        </Typography>
        
        <RekorExplorer />
      </Container>

      <Container component="footer" className={styles.footer}>
        <a
            href="https://chainguard.dev"
            target="_blank"
            rel="noopener noreferrer">
          <Image src="/logo-full.svg" alt="Chainguard Logo" width={128} height={45} />
        </a>
      </Container>
    </div>
  )
}

export default Home
