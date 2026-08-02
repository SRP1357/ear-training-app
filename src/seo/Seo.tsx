import { useEffect } from 'react';
import { SITE_URL, type PageSeo } from './site';

function upsertMeta(name: string, content: string) {
  let el = document.head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel: string, href: string) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Updates document title, description, and canonical URL for the active route. */
export function Seo({ title, description, path }: PageSeo) {
  useEffect(() => {
    const url = path === '/' ? `${SITE_URL}/` : `${SITE_URL}${path}`;
    document.title = title;
    upsertMeta('description', description);
    upsertLink('canonical', url);
  }, [title, description, path]);

  return null;
}
