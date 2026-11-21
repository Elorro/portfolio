import type { Metric } from './schema';

export interface AggregateProject {
  slug: string;
  links: { live?: string };
  metrics: Metric[];
}

export interface HeroAggregates {
  testsPassing: { total: number; byProject: Array<{ slug: string; value: number; asOf: string }> };
  demoVerified: number;
  demoVerifiedByProject: Array<{ slug: string; asOf: string }>;
  oldestAsOf: string | null;
}

export function aggregateHero(projects: AggregateProject[]): HeroAggregates {
  const slugs = new Set<string>();
  for (const project of projects) {
    if (slugs.has(project.slug)) {
      throw new Error(`aggregateHero: slug duplicado "${project.slug}"; filtra por idioma antes de agregar`);
    }
    slugs.add(project.slug);
  }
  const measured = projects.map((project) => ({
    project,
    metrics: project.metrics.filter((metric) => metric.epistemic === 'medido'),
  }));
  const testsByProject = measured.flatMap(({ project, metrics }) => {
    const metric = metrics.find((item) => item.id === 'tests_passing' && typeof item.value === 'number' && item.as_of);
    return metric && typeof metric.value === 'number' && metric.as_of
      ? [{ slug: project.slug, value: metric.value, asOf: metric.as_of }]
      : [];
  });
  const verifiedProjects = measured.filter(({ project, metrics }) =>
    Boolean(project.links.live) && metrics.some((metric) => metric.id === 'demo_verified'),
  );
  const demoVerifiedByProject = verifiedProjects.flatMap(({ project, metrics }) => {
    const metric = metrics.find((item) => item.id === 'demo_verified' && item.as_of);
    return metric?.as_of ? [{ slug: project.slug, asOf: metric.as_of }] : [];
  });
  const usedDates = [
    ...testsByProject.map((item) => item.asOf),
    ...verifiedProjects.flatMap(({ metrics }) =>
      metrics.filter((metric) => metric.id === 'demo_verified' && metric.as_of).map((metric) => metric.as_of as string),
    ),
  ].sort();

  return {
    testsPassing: {
      total: testsByProject.reduce((sum, item) => sum + item.value, 0),
      byProject: testsByProject,
    },
    demoVerified: verifiedProjects.length,
    demoVerifiedByProject,
    oldestAsOf: usedDates[0] ?? null,
  };
}
