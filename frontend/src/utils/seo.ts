interface MetaOptions {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  noIndex?: boolean;
  keywords?: string[];
  publishedTime?: string;
  author?: string;
}

const DEFAULT_SITE_NAME = 'Dispatch News';
const DEFAULT_DESCRIPTION = 'Breaking news, in-depth analysis, and world events from Dispatch News Portal.';
const DEFAULT_IMAGE = '/og-default.jpg';

export function buildMeta(options: MetaOptions = {}) {
  const {
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_IMAGE,
    url = typeof window !== 'undefined' ? window.location.href : '',
    type = 'website',
    siteName = DEFAULT_SITE_NAME,
    twitterCard = 'summary_large_image',
    noIndex = false,
    keywords = [],
    publishedTime,
    author,
  } = options;

  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  const meta: Array<{ name?: string; property?: string; content: string }> = [
    { name: 'description', content: description },
    // Open Graph
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: description },
    { property: 'og:image', content: image },
    { property: 'og:url', content: url },
    { property: 'og:type', content: type },
    { property: 'og:site_name', content: siteName },
    // Twitter
    { name: 'twitter:card', content: twitterCard },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
  ];

  if (noIndex) {
    meta.push({ name: 'robots', content: 'noindex,nofollow' });
  }

  if (keywords.length > 0) {
    meta.push({ name: 'keywords', content: keywords.join(', ') });
  }

  if (publishedTime) {
    meta.push({ property: 'article:published_time', content: publishedTime });
  }

  if (author) {
    meta.push({ property: 'article:author', content: author });
  }

  return { title: fullTitle, meta };
}
