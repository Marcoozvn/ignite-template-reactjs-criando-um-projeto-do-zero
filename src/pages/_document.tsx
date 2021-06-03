import Document, { Html, Head, Main, NextScript } from 'next/document';

export default class MyDocument extends Document {
  render(): JSX.Element {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
            rel="stylesheet"
          />
          <link rel="shortcut icon" href="favicon.png" type="image/png" />
          <link
            rel="stylesheet"
            href="//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.3.2/build/styles/default.min.css"
          />
          <script
            async
            defer
            src="https://static.cdn.prismic.io/prismic.js?new=true&repo=marcoscesar-spacetraveling"
          />
        </Head>
        <body>
          <Main />

          <NextScript />
        </body>
      </Html>
    );
  }
}
