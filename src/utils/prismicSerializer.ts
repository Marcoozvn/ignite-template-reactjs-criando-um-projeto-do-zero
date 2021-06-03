import PrismicDOM, { HTMLSerializer } from 'prismic-dom';

const { Elements } = PrismicDOM.RichText;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const htmlSerializer: HTMLSerializer<string> = (
  type,
  element,
  content,
  children
) => {
  switch (type) {
    case Elements.preformatted:
      // eslint-disable-next-line no-case-declarations
      const findLanguage = element.text.trim().match(/```\w+/g);

      if (findLanguage) {
        const language = findLanguage[0].substring(3);

        return `<pre><code class="language-${language}">${children
          .join('')
          .replace(`\`\`\`${language}`, '')
          .trim()}</code></pre>`;
      }

      return `<pre class="code">${children.join('')}</pre>`;

    default:
      return null;
  }
};
