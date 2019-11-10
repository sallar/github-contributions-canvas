declare module "github-contributions-canvas" {
  type DrawContributionsProps = {
    data: string | null;
    username: string;
    themeName: string;
    footerText: string;
  };

  function drawContributions(
    canvas: HTMLCanvasElement,
    props: DrawContributionsProps
  ): void;
}
