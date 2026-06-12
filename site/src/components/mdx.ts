/** Composants disponibles dans TOUT fichier MDX sans import — passés via
    `<Content components={mdxComponents} />` par les pages de rendu.
    C'est la liste blanche du cadre pédagogique. */
import Note from "./Note.astro";
import Exercise from "./Exercise.astro";
import Cmd from "./Cmd.astro";
import TermLine from "./TermLine.astro";
import Slides from "./Slides.astro";
import Slide from "./Slide.astro";
import Escape from "./Escape.astro";
import IpSim from "./IpSim.astro";
import BootBench from "./BootBench.astro";
import ArchiStack from "./ArchiStack.astro";
import LayerStack from "./LayerStack.astro";
import BuildStack from "./BuildStack.astro";
import Bypass from "./Bypass.astro";

export const mdxComponents = {
  Note,
  Exercise,
  Cmd,
  TermLine,
  Slides,
  Slide,
  Escape,
  IpSim,
  BootBench,
  ArchiStack,
  LayerStack,
  BuildStack,
  Bypass,
};
