export const ROUTE_BASE = {
  home: '/',
  aiLiteracy: '/ai-literacy',
  creativeClassroom: '/creative-classroom',
  collaboration: '/collaboration',
  dashboard: '/dashboard',
  immersive: '/immersive',
} as const;

export const ROUTES = {
  home: ROUTE_BASE.home,
  aiLiteracy: {
    root: ROUTE_BASE.aiLiteracy,
    mission: (missionType: string = ':missionType') =>
      `${ROUTE_BASE.aiLiteracy}/mission/${missionType}`,
    challenge: (missionType: string = ':missionType', challengeId: string = ':challengeId') =>
      `${ROUTE_BASE.aiLiteracy}/challenge/${missionType}/${challengeId}`,
  },
  creativity: {
    root: `${ROUTE_BASE.creativeClassroom}/creativity`,
    module: (slug: string = ':module') => `${ROUTE_BASE.creativeClassroom}/creativity/${slug}`,
  },
  collaboration: {
    root: ROUTE_BASE.collaboration,
    smartDiscussion: `${ROUTE_BASE.collaboration}/smart-discussion`,
    perspective: `${ROUTE_BASE.collaboration}/perspective`,
  },
  dashboard: {
    root: ROUTE_BASE.dashboard,
    activityLog: `${ROUTE_BASE.dashboard}/activity-log`,
    classBoard: `${ROUTE_BASE.dashboard}/class-board`,
    teacherAdmin: `${ROUTE_BASE.dashboard}/teacher-admin`,
  },
  immersive: {
    root: ROUTE_BASE.immersive,
    lesson: (slug: string = ':lesson') => `${ROUTE_BASE.immersive}/${slug}`,
    history: `${ROUTE_BASE.immersive}/history`,
    coach: `${ROUTE_BASE.immersive}/coach`,
  },
} as const;

export type MissionRouteParams = {
  missionType: string;
};

export type ChallengeRouteParams = MissionRouteParams & {
  challengeId: string;
};
