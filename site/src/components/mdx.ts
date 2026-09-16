import VideoEmbed from "./VideoEmbed.astro";
import NeuralNetworkLab from "./NeuralNetworkLab.astro";
import RagLab from "./RagLab.astro";

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
import CodeFile from "./CodeFile.astro";
import Duo from "./Duo.astro";
import MachineMap from "./MachineMap.astro";
import AnsibleMap from "./AnsibleMap.astro";
import VirtStack from "./VirtStack.astro";
import Img from "./Img.astro";
import G from "./G.astro";
import WikiImage from "./WikiImage.astro";
import Artefact from "./Artefact.astro";
import LearningLoop from "./LearningLoop.astro";
import NeuralNetworkDemo from "./NeuralNetworkDemo.astro";
import RagFlow from "./RagFlow.astro";

export const mdxComponents = {
  VideoEmbed,
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
  CodeFile,
  Duo,
  MachineMap,
  AnsibleMap,
  VirtStack,
  Img,
  G,
  WikiImage,
  Artefact,
  LearningLoop,
  NeuralNetworkDemo,
  RagFlow,
};

// Les noms historiques restent valides, mais rendent les artefacts complets.
Object.assign(mdxComponents, {
  NeuralNetworkDemo: NeuralNetworkLab,
  RagFlow: RagLab,
});
