import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  path?: string;
}

const BASE_URL = 'https://lotto-maker.vercel.app';

export function useSEO({ title, description, keywords, path = '' }: SEOProps) {
  useEffect(() => {
    const fullTitle = `${title} | 로또메이커`;
    const url = `${BASE_URL}${path}`;

    // Title
    document.title = fullTitle;

    // Meta tags
    const metaTags: Record<string, string> = {
      description,
      keywords: keywords || '로또, 로또번호생성기, 로또번호추첨, 로또645, 로또머신',
      'og:title': fullTitle,
      'og:description': description,
      'og:url': url,
      'twitter:title': fullTitle,
      'twitter:description': description,
    };

    Object.entries(metaTags).forEach(([name, content]) => {
      // Check if it's an OG or Twitter tag
      const isProperty = name.startsWith('og:') || name.startsWith('twitter:');
      const selector = isProperty
        ? `meta[property="${name}"]`
        : `meta[name="${name}"]`;

      let meta = document.querySelector(selector) as HTMLMetaElement | null;

      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        if (isProperty) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    });

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (canonical) {
      canonical.href = url;
    }

    // Cleanup
    return () => {
      // Reset to default title on unmount (optional)
    };
  }, [title, description, keywords, path]);
}

export default useSEO;
