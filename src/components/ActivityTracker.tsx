import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { logActivity } from "../utils/activityLog";

const PATH_LABELS: Array<{
  test: (pathname: string) => boolean;
  entry: (
    pathname: string
  ) => { category: string; label: string; detail: string } | null;
}> = [
    {
      test: (path) => path === "/ai-literacy",
      entry: () => ({
        category: "AI 리터러시",
        label: "인트로",
        detail: "미션 선택 화면을 살펴봤어요.",
      }),
    },
    {
      test: (path) => path.startsWith("/ai-literacy/mission/"),
      entry: (path) => {
        const [, , , mission] = path.split("/");
        if (!mission) return null;
        const missionName =
          mission === "guardrail" ? "안전장치 확인" : "편견 찾기";
        return {
          category: "AI 리터러시",
          label: `미션 허브 - ${missionName}`,
          detail: `${missionName} 설명과 케이스를 확인했어요.`,
        };
      },
    },
    {
      test: (path) => path.startsWith("/ai-literacy/challenge/"),
      entry: () => ({
        category: "AI 리터러시",
        label: "라이브 챌린지",
        detail: "실시간 AI 반응을 조사했어요.",
      }),
    },
    {
      test: (path) => path === "/creative-classroom/creativity/sparring",
      entry: () => ({
        category: "창의력",
        label: "AI 상상 스파링",
        detail: "엉뚱한 반론으로 이야기를 새로 썼어요.",
      }),
    },
    {
      test: (path) => path === "/creative-classroom/creativity/art",
      entry: () => ({
        category: "창의력",
        label: "AI 아트 워크숍",
        detail: "작품에 새로운 화풍을 입혔어요.",
      }),
    },
    {
      test: (path) => path === "/creative-classroom/creativity/writing",
      entry: () => ({
        category: "창의력",
        label: "AI 글쓰기 듀오",
        detail: "맞춤 글쓰기 안내를 받았어요.",
      }),
    },
    {
      test: (path) => path === "/immersive/history",
      entry: () => ({
        category: "몰입형 체험",
        label: "역사 인터뷰",
        detail: "AI 세종대왕과 대화를 나눴어요.",
      }),
    },
    {
      test: (path) => path === "/immersive/coach",
      entry: () => ({
        category: "몰입형 체험",
        label: "AI 피트니스 코치",
        detail: "움직임을 따라 하며 연습했어요.",
      }),
    },
    {
      test: (path) => path === "/collaboration/smart-discussion",
      entry: () => ({
        category: "논리/협업",
        label: "곰곰이 스마트 토론",
        detail: "말하기와 경청 연습을 해봤어요.",
      }),
    },
  ];

export const ActivityTracker = () => {
  const location = useLocation();
  const previousPath = useRef<string>("");

  useEffect(() => {
    const { pathname } = location;
    if (pathname === previousPath.current) {
      return;
    }
    previousPath.current = pathname;

    const matcher = PATH_LABELS.find((candidate) => candidate.test(pathname));
    const entry = matcher?.entry(pathname);
    if (entry) {
      logActivity(entry);
    }
  }, [location]);

  return null;
};

export default ActivityTracker;
