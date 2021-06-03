import { GetStaticProps } from 'next';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import { useState } from 'react';
import Header from '../components/Header';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean;
}

export default function Home({
  postsPagination,
  preview,
}: HomeProps): JSX.Element {
  const [posts, setPosts] = useState<Post[]>(postsPagination.results);
  const [nextPageLink, setNextPageLink] = useState(postsPagination.next_page);

  function handleLoadPosts(): void {
    if (nextPageLink) {
      fetch(nextPageLink)
        .then(response => response.json())
        .then((response: PostPagination) => {
          setNextPageLink(response.next_page);
          setPosts([...posts, ...response.results]);
        })
        .catch(err => console.log(err));
    }
  }

  return (
    <>
      <Head>
        <title>Spacetraveling | Home</title>
      </Head>
      <Header />
      <div className={styles.homeContainer}>
        <div className={styles.posts}>
          {posts.map(post => (
            <Link href={`/post/${post.uid}`} key={post.uid}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.postInfo}>
                  <div>
                    <FiCalendar />
                    <time>
                      {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy',
                        {
                          locale: ptBR,
                        }
                      )}
                    </time>
                  </div>
                  <div>
                    <FiUser />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}

          {nextPageLink && (
            <button
              type="button"
              onClick={handleLoadPosts}
              className={styles.loadPostsButton}
            >
              Carregar mais posts
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();

  const { next_page, results } = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 2,
      ref: previewData?.ref ?? null,
    }
  );

  return {
    props: {
      postsPagination: {
        next_page,
        results,
      },
      preview,
    },
    revalidate: 60 * 60,
  };
};
