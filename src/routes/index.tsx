import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { ThemeApplier } from "@/components/living/ThemeApplier";
import { CursorOrb } from "@/components/living/CursorOrb";
import { Intro } from "@/components/living/Intro";
import { AIOrb } from "@/components/living/AIOrb";
import { Narrator } from "@/components/living/Narrator";
import { BehaviorTracker } from "@/components/living/BehaviorTracker";
import { Nav } from "@/components/living/Nav";
import { ShaderBackground } from "@/components/living/ShaderBackground";
import { AmbientEvolver } from "@/components/living/AmbientEvolver";
import { EnvFeedback } from "@/components/living/EnvFeedback";
import { SectionIntensity } from "@/components/living/SectionIntensity";
import { GenerativeSections } from "@/components/living/GenerativeSections";
import { SmoothScroll } from "@/components/living/SmoothScroll";
import { Hero } from "@/components/living/sections/Hero";
import { Capabilities } from "@/components/living/sections/Capabilities";
import { Themes } from "@/components/living/sections/Themes";
import { CustomTheme } from "@/components/living/sections/CustomTheme";
import { Mutation } from "@/components/living/sections/Mutation";
import { Behavior } from "@/components/living/sections/Behavior";
import { Timeline } from "@/components/living/sections/Timeline";
import { Ending } from "@/components/living/sections/Ending";
import { useLiving } from "@/store/living";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Living Websites — A site that feels alive" },
      {
        name: "description",
        content:
          "A cinematic, adaptive web experience that evolves with your behavior, taste, and prompts in real time.",
      },
      { property: "og:title", content: "Living Websites" },
      {
        property: "og:description",
        content: "The first website that feels alive — adaptive, cinematic, intelligent.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const trackClick = useLiving((s) => s.trackClick);
  useEffect(() => {
    const onClick = () => trackClick();
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, [trackClick]);

  return (
    <>
      <SmoothScroll />
      <ThemeApplier />
      <BehaviorTracker />
      <AmbientEvolver />
      <EnvFeedback />
      <CursorOrb />
      <Intro />
      <Nav />
      <Narrator />
      <main className="relative">
        <SectionIntensity id="hero"><Hero /></SectionIntensity>
        <SectionIntensity id="themes"><Themes /></SectionIntensity>
        <SectionIntensity id="custom"><CustomTheme /></SectionIntensity>
        <SectionIntensity id="mutation"><Mutation /></SectionIntensity>
        <SectionIntensity id="capabilities"><Capabilities /></SectionIntensity>
        <SectionIntensity id="behavior"><Behavior /></SectionIntensity>
        <SectionIntensity id="timeline"><Timeline /></SectionIntensity>
        <GenerativeSections />
        <SectionIntensity id="ending"><Ending /></SectionIntensity>
      </main>
      <AIOrb />
    </>
  );
}
