declare module "github-contributions-canvas" {
  type YearData = {
    year: string;
    total: number;
    range: {
      start: string;
      end: string;
    };
  };

  type ContributionData = {
    date: string;
    count: number;
    color: string;
    intensity: number;
  };

  type DrawContributionsProps = {
    data: {
      years: YearData[];
      contributions: ContributionData[];
    };
    username: string;
    themeName: string;
    footerText: string;
  };

  function drawContributions(
    canvas: HTMLCanvasElement,
    props: DrawContributionsProps
  ): void;
}
