import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { client } from '../libs/client';

export default function Home({ data }) {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>{data.text}</h1>
        <p className={styles.description}>
          Get started by editing <code className={styles.code}>pages/index.js</code>
        </p>
      </main>
    </div>
  );
}

export const getStaticProps = async () => {
  const data = await client.get({
    endpoint: 'hello',
  });

  return {
    props: {
      data,
    },
  };
};
