export type Profile = {
  email: string;
  github: string;
  linkedin: string;
  cv: { es?: string; en?: string };
};

export function getProfile(source = process.env.CONTENT_SOURCE ?? 'real'): Profile {
  return {
    email: 'contact@example.invalid',
    github: 'https://github.invalid/example',
    linkedin: 'https://linkedin.invalid/in/example',
    cv: source === 'fixtures' ? {} : { es: '/cv-es.pdf', en: '/cv-en.pdf' },
  };
}

export const profile = getProfile();
