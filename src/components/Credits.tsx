"use client";

import GithubCorner from "react-github-corner";

export const Credits: React.FC = () => (
  <GithubCorner
    href={"https://github.com/gfargo/tune.observer"}
    bannerColor="#15162c"
    octoColor="#CC66FF"
    size={96}
    direction="right"
    svgStyle={{ mixBlendMode: "revert" }}
  />
);
