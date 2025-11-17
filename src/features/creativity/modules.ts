import { ROUTES } from '../../routes/paths';

export type CreativityModuleKey = 'sparring' | 'art' | 'writing';

export interface CreativityModule {
  key: CreativityModuleKey;
  slug: CreativityModuleKey;
  label: string;
  menuLabel: string;
  summary: string;
}

export const creativityModules: ReadonlyArray<CreativityModule> = [
  {
    key: 'sparring',
    slug: 'sparring',
    label: 'AI 상상 스파링',
    menuLabel: 'AI 스파링',
    summary: '엉뚱한 반론으로 이야기 구조 재구성',
  },
  {
    key: 'art',
    slug: 'art',
    label: 'AI 아트 워크숍',
    menuLabel: '아트 워크숍',
    summary: '학생 그림을 명작 스타일로 즉시 변환',
  },
  {
    key: 'writing',
    slug: 'writing',
    label: 'AI 글쓰기 듀오',
    menuLabel: '글쓰기 듀오',
    summary: '학년/장르 맞춤 글쓰기 가이드 생성',
  },
] as const;

export const getCreativityModulePath = (slug: CreativityModule['slug']): string =>
  `${ROUTES.creativity.root}/${slug}`;

export const CREATIVITY_BASE_PATH = ROUTES.creativity.root;
