/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import { useEffect, useMemo } from 'react';
import Prismic from '@prismicio/client';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import hljs from 'highlight.js';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';
import { htmlSerializer } from '../../utils/prismicSerializer';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { Comments } from '../../components/Comments';

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
      alt: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
  prevPost: Post;
  nextPost: Post;
}

export default function Post({
  post,
  prevPost,
  nextPost,
}: PostProps): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    hljs.highlightAll();
  }, [post]);

  const numberOfWords = useMemo<number>(() => {
    return post?.data?.content.reduce((prev, curr) => {
      const bodyText = RichText.asText(curr.body);

      const bodyTextSplitted = bodyText.split(/\s+/g);

      return prev + curr.heading.length + bodyTextSplitted.length;
    }, 0);
  }, [post]);

  const readTime = useMemo(() => {
    return Math.ceil(numberOfWords / 200);
  }, [numberOfWords]);

  const formattedPublicationDate = useMemo<string>(() => {
    if (post) {
      return format(new Date(post.first_publication_date), 'dd MMM yyyy', {
        locale: ptBR,
      }).toLocaleLowerCase();
    }

    return '';
  }, [post]);

  const formattedLastPublicationDate = useMemo<string>(() => {
    if (post?.last_publication_date) {
      return format(
        new Date(post.last_publication_date),
        "dd MMM yyyy, 'às' H:mm",
        {
          locale: ptBR,
        }
      ).toLocaleLowerCase();
    }

    return '';
  }, [post]);

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <img
          src={post.data?.banner.url}
          alt={post.data.banner.alt ?? 'Banner'}
        />

        <div className={styles.postContent}>
          <header>
            <strong>{post.data.title}</strong>
            <div className={styles.postInfo}>
              <div>
                <FiCalendar />
                <time>{formattedPublicationDate}</time>
              </div>
              <div>
                <FiUser />
                <span>{post.data.author}</span>
              </div>
              <div>
                <FiClock />
                <span>{`${readTime} min`}</span>
              </div>
            </div>
            {post.last_publication_date && (
              <span>* editado em {formattedLastPublicationDate}</span>
            )}
          </header>

          {post.data.content.map(content => (
            <div className={styles.postBody} key={content.heading}>
              <strong>{content.heading}</strong>
              <div
                dangerouslySetInnerHTML={{
                  __html: RichText.asHtml(
                    content.body,
                    string => string,
                    htmlSerializer
                  ),
                }}
              />
            </div>
          ))}
        </div>

        <footer>
          {prevPost?.data?.title ? (
            <div>
              <p>{prevPost.data.title}</p>
              <Link href={`/post/${encodeURIComponent(prevPost.uid)}`} passHref>
                <a>Post anterior</a>
              </Link>
            </div>
          ) : (
            <div />
          )}

          {nextPost?.data?.title ? (
            <div>
              <p>{nextPost.data.title}</p>
              <Link href={`/post/${encodeURIComponent(nextPost.uid)}`} passHref>
                <a>Próximo post</a>
              </Link>
            </div>
          ) : (
            <div />
          )}
        </footer>
        <Comments />
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const { results } = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 2,
    }
  );

  const paths = results.map(post => ({ params: { slug: post.uid } }));

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const { results: prevPostQueryResults } = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date desc]',
      fetch: ['posts.uid', 'posts.title'],
    }
  );

  const { results: nextPostQueryResults } = await prismic.query(
    Prismic.predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      after: `${response.id}`,
      orderings: '[document.first_publication_date]',
      fetch: ['posts.uid', 'posts.title'],
    }
  );

  const [prevPost] = prevPostQueryResults;
  const [nextPost] = nextPostQueryResults;

  return {
    props: {
      post: {
        ...response,
      },
      prevPost: prevPost ?? null,
      nextPost: nextPost ?? null,
    },
  };
};
