// components/yoga/PoseFigure.tsx
// Each pose's hand-drawn stick-figure SVG, ported 1:1 from the AuraFit HTML reference.
// Rendered inside a 58x58 rounded card slot on AsanaCard.

import React from "react";
import Svg, {
  Rect,
  Circle,
  Line,
  Path,
  Defs,
  RadialGradient,
  Stop,
} from "react-native-svg";

interface Props {
  figureKey: string;
  accent: string; // category accent hex, used for the soft bg glow
}

/** Soft radial-glow backing rect shared by every figure */
function FigureBg({ id, accent }: { id: string; accent: string }) {
  return (
    <>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={accent} stopOpacity={0.15} />
          <Stop offset="100%" stopColor={accent} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Rect width={58} height={58} rx={12} fill={`url(#${id})`} />
    </>
  );
}

export default function PoseFigure({ figureKey, accent }: Props) {
  const bgId = `bg-${figureKey}`;

  switch (figureKey) {
    /* ───────── STANDING ───────── */
    case "tadasana":
      return (
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <FigureBg id={bgId} accent={accent} />
          <Circle cx={29} cy={9} r={5} stroke="#34D399" strokeWidth={1.5} fill="none" />
          <Line x1={29} y1={14} x2={29} y2={34} stroke="#34D399" strokeWidth={2} strokeLinecap="round" />
          <Line x1={29} y1={22} x2={20} y2={30} stroke="#059669" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={29} y1={22} x2={38} y2={30} stroke="#059669" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={29} y1={34} x2={24} y2={50} stroke="#34D399" strokeWidth={1.8} strokeLinecap="round" />
          <Line x1={29} y1={34} x2={34} y2={50} stroke="#34D399" strokeWidth={1.8} strokeLinecap="round" />
          <Line x1={19} y1={52} x2={28} y2={52} stroke="#34D399" strokeWidth={1.2} strokeLinecap="round" />
          <Line x1={30} y1={52} x2={39} y2={52} stroke="#34D399" strokeWidth={1.2} strokeLinecap="round" />
        </Svg>
      );

    case "vrksasana":
      return (
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <FigureBg id={bgId} accent={accent} />
          <Circle cx={29} cy={8} r={5} stroke="#34D399" strokeWidth={1.5} fill="none" />
          <Line x1={29} y1={13} x2={29} y2={32} stroke="#34D399" strokeWidth={2} strokeLinecap="round" />
          <Line x1={29} y1={20} x2={24} y2={10} stroke="#059669" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={29} y1={20} x2={34} y2={10} stroke="#059669" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={24} y1={10} x2={34} y2={10} stroke="#34D399" strokeWidth={1} strokeLinecap="round" />
          <Line x1={29} y1={32} x2={29} y2={52} stroke="#34D399" strokeWidth={2} strokeLinecap="round" />
          <Line x1={29} y1={36} x2={20} y2={44} stroke="#059669" strokeWidth={1.5} strokeLinecap="round" />
          <Line
            x1={20}
            y1={44}
            x2={22}
            y2={52}
            stroke="#059669"
            strokeWidth={1.2}
            strokeDasharray="2 2"
            strokeLinecap="round"
            opacity={0.5}
          />
          <Line x1={24} y1={52} x2={34} y2={52} stroke="#34D399" strokeWidth={1.2} strokeLinecap="round" />
        </Svg>
      );

    case "warrior2":
      return (
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <FigureBg id={bgId} accent={accent} />
          <Circle cx={29} cy={9} r={5} stroke="#34D399" strokeWidth={1.5} fill="none" />
          <Line x1={29} y1={14} x2={29} y2={30} stroke="#34D399" strokeWidth={2} strokeLinecap="round" />
          <Line x1={29} y1={22} x2={10} y2={22} stroke="#059669" strokeWidth={1.6} strokeLinecap="round" />
          <Line x1={29} y1={22} x2={48} y2={22} stroke="#059669" strokeWidth={1.6} strokeLinecap="round" />
          <Line x1={29} y1={30} x2={14} y2={48} stroke="#34D399" strokeWidth={2} strokeLinecap="round" />
          <Line x1={14} y1={48} x2={9} y2={52} stroke="#34D399" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={29} y1={30} x2={42} y2={42} stroke="#34D399" strokeWidth={2} strokeLinecap="round" />
          <Line x1={42} y1={42} x2={48} y2={52} stroke="#34D399" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={7} y1={53} x2={51} y2={53} stroke="#34D399" strokeWidth={0.8} opacity={0.3} />
        </Svg>
      );

    case "trikonasana":
      return (
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <FigureBg id={bgId} accent={accent} />
          <Circle cx={34} cy={9} r={5} stroke="#34D399" strokeWidth={1.5} fill="none" />
          <Line x1={34} y1={14} x2={28} y2={34} stroke="#34D399" strokeWidth={2} strokeLinecap="round" />
          <Line x1={28} y1={22} x2={44} y2={16} stroke="#059669" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={28} y1={22} x2={16} y2={38} stroke="#059669" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={28} y1={34} x2={14} y2={52} stroke="#34D399" strokeWidth={2} strokeLinecap="round" />
          <Line x1={28} y1={34} x2={44} y2={50} stroke="#34D399" strokeWidth={2} strokeLinecap="round" />
          <Line x1={9} y1={53} x2={49} y2={53} stroke="#34D399" strokeWidth={0.8} opacity={0.3} />
        </Svg>
      );

    /* ───────── SITTING ───────── */
    case "padmasana":
      return (
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <FigureBg id={bgId} accent={accent} />
          <Circle cx={29} cy={10} r={5} stroke="#B59BFF" strokeWidth={1.5} fill="none" />
          <Line x1={29} y1={15} x2={29} y2={32} stroke="#B59BFF" strokeWidth={2} strokeLinecap="round" />
          <Line x1={29} y1={23} x2={18} y2={32} stroke="#8B5CF6" strokeWidth={1.5} strokeLinecap="round" />
          <Circle cx={16} cy={33} r={2} stroke="#B59BFF" strokeWidth={1.2} fill="none" />
          <Line x1={29} y1={23} x2={40} y2={32} stroke="#8B5CF6" strokeWidth={1.5} strokeLinecap="round" />
          <Circle cx={42} cy={33} r={2} stroke="#B59BFF" strokeWidth={1.2} fill="none" />
          <Line x1={29} y1={32} x2={14} y2={44} stroke="#7D53FF" strokeWidth={2} strokeLinecap="round" />
          <Line x1={14} y1={44} x2={8} y2={46} stroke="#6D28D9" strokeWidth={1.4} strokeLinecap="round" />
          <Line x1={29} y1={32} x2={44} y2={44} stroke="#7D53FF" strokeWidth={2} strokeLinecap="round" />
          <Line x1={44} y1={44} x2={50} y2={46} stroke="#6D28D9" strokeWidth={1.4} strokeLinecap="round" />
          <Circle cx={29} cy={24} r={2} fill="#B59BFF" opacity={0.7} />
          <Circle cx={29} cy={18} r={1.2} fill="#7D53FF" opacity={0.5} />
        </Svg>
      );

    case "paschimottanasana":
      return (
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <FigureBg id={bgId} accent={accent} />
          <Circle cx={44} cy={20} r={5} stroke="#B59BFF" strokeWidth={1.5} fill="none" />
          <Line x1={44} y1={25} x2={30} y2={34} stroke="#B59BFF" strokeWidth={2} strokeLinecap="round" />
          <Line x1={30} y1={34} x2={10} y2={36} stroke="#8B5CF6" strokeWidth={1.8} strokeLinecap="round" />
          <Line x1={44} y1={28} x2={18} y2={36} stroke="#7D53FF" strokeWidth={1.5} strokeLinecap="round" />
          <Circle cx={12} cy={37} r={2} stroke="#B59BFF" strokeWidth={1.2} fill="none" />
          <Line x1={30} y1={36} x2={10} y2={38} stroke="#B59BFF" strokeWidth={1.8} strokeLinecap="round" />
          <Line x1={32} y1={38} x2={10} y2={40} stroke="#8B5CF6" strokeWidth={1.4} strokeLinecap="round" />
          <Line x1={8} y1={42} x2={50} y2={42} stroke="#7D53FF" strokeWidth={0.8} opacity={0.3} />
        </Svg>
      );

    case "baddhakonasana":
      return (
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <FigureBg id={bgId} accent={accent} />
          <Circle cx={29} cy={9} r={5} stroke="#B59BFF" strokeWidth={1.5} fill="none" />
          <Line x1={29} y1={14} x2={29} y2={30} stroke="#B59BFF" strokeWidth={2} strokeLinecap="round" />
          <Line x1={29} y1={21} x2={20} y2={28} stroke="#8B5CF6" strokeWidth={1.4} strokeLinecap="round" />
          <Line x1={29} y1={21} x2={38} y2={28} stroke="#8B5CF6" strokeWidth={1.4} strokeLinecap="round" />
          <Line x1={29} y1={30} x2={10} y2={44} stroke="#7D53FF" strokeWidth={2} strokeLinecap="round" />
          <Line x1={10} y1={44} x2={29} y2={48} stroke="#6D28D9" strokeWidth={1.4} strokeLinecap="round" />
          <Line x1={29} y1={30} x2={48} y2={44} stroke="#7D53FF" strokeWidth={2} strokeLinecap="round" />
          <Line x1={48} y1={44} x2={29} y2={48} stroke="#6D28D9" strokeWidth={1.4} strokeLinecap="round" />
          <Circle cx={29} cy={48} r={2} fill="#B59BFF" opacity={0.6} />
        </Svg>
      );

    /* ───────── SUPINE ───────── */
    case "savasana":
      return (
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <FigureBg id={bgId} accent={accent} />
          <Circle cx={50} cy={29} r={5} stroke="#38BDF8" strokeWidth={1.5} fill="none" />
          <Line x1={45} y1={29} x2={8} y2={29} stroke="#38BDF8" strokeWidth={2.2} strokeLinecap="round" />
          <Line x1={36} y1={29} x2={32} y2={40} stroke="#0EA5E9" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={22} y1={29} x2={18} y2={40} stroke="#0EA5E9" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={8} y1={29} x2={6} y2={24} stroke="#38BDF8" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={8} y1={29} x2={6} y2={34} stroke="#38BDF8" strokeWidth={1.5} strokeLinecap="round" />
          <Circle cx={50} cy={24} r={1} fill="#38BDF8" opacity={0.5} />
          <Circle cx={50} cy={34} r={1} fill="#38BDF8" opacity={0.5} />
          <Line x1={8} y1={42} x2={52} y2={42} stroke="#38BDF8" strokeWidth={0.7} opacity={0.25} />
        </Svg>
      );

    case "setubandhasana":
      return (
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <FigureBg id={bgId} accent={accent} />
          <Circle cx={46} cy={30} r={4.5} stroke="#38BDF8" strokeWidth={1.5} fill="none" />
          <Line x1={41} y1={32} x2={28} y2={36} stroke="#38BDF8" strokeWidth={1.8} strokeLinecap="round" />
          <Path d="M28 36 Q20 22 14 40" stroke="#0EA5E9" strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Line x1={36} y1={34} x2={34} y2={44} stroke="#0EA5E9" strokeWidth={1.4} strokeLinecap="round" />
          <Line x1={28} y1={36} x2={26} y2={44} stroke="#0EA5E9" strokeWidth={1.4} strokeLinecap="round" />
          <Line x1={14} y1={40} x2={10} y2={50} stroke="#38BDF8" strokeWidth={1.8} strokeLinecap="round" />
          <Line x1={10} y1={50} x2={18} y2={50} stroke="#38BDF8" strokeWidth={1.4} strokeLinecap="round" />
          <Line x1={8} y1={50} x2={52} y2={50} stroke="#38BDF8" strokeWidth={0.7} opacity={0.25} />
        </Svg>
      );

    case "anandabalasana":
      return (
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <FigureBg id={bgId} accent={accent} />
          <Circle cx={29} cy={14} r={5} stroke="#38BDF8" strokeWidth={1.5} fill="none" />
          <Line x1={29} y1={19} x2={29} y2={36} stroke="#38BDF8" strokeWidth={1.8} strokeLinecap="round" />
          <Line x1={29} y1={32} x2={14} y2={22} stroke="#0EA5E9" strokeWidth={1.8} strokeLinecap="round" />
          <Line x1={14} y1={22} x2={10} y2={14} stroke="#0EA5E9" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={29} y1={32} x2={44} y2={22} stroke="#0EA5E9" strokeWidth={1.8} strokeLinecap="round" />
          <Line x1={44} y1={22} x2={48} y2={14} stroke="#0EA5E9" strokeWidth={1.5} strokeLinecap="round" />
          <Circle cx={10} cy={12} r={2} stroke="#38BDF8" strokeWidth={1.2} fill="none" />
          <Circle cx={48} cy={12} r={2} stroke="#38BDF8" strokeWidth={1.2} fill="none" />
          <Line
            x1={29}
            y1={25}
            x2={12}
            y2={14}
            stroke="#7DD3FC"
            strokeWidth={1.2}
            strokeDasharray="2 2"
            strokeLinecap="round"
            opacity={0.6}
          />
          <Line
            x1={29}
            y1={25}
            x2={46}
            y2={14}
            stroke="#7DD3FC"
            strokeWidth={1.2}
            strokeDasharray="2 2"
            strokeLinecap="round"
            opacity={0.6}
          />
          <Line x1={8} y1={40} x2={50} y2={40} stroke="#38BDF8" strokeWidth={0.7} opacity={0.25} />
        </Svg>
      );

    /* ───────── PRONE ───────── */
    case "bhujangasana":
      return (
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <FigureBg id={bgId} accent={accent} />
          <Circle cx={48} cy={18} r={5} stroke="#FB923C" strokeWidth={1.5} fill="none" />
          <Line x1={43} y1={22} x2={30} y2={32} stroke="#FB923C" strokeWidth={2} strokeLinecap="round" />
          <Line x1={38} y1={26} x2={38} y2={38} stroke="#EA580C" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={32} y1={30} x2={32} y2={40} stroke="#EA580C" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={30} y1={32} x2={8} y2={36} stroke="#F97316" strokeWidth={2.2} strokeLinecap="round" />
          <Line x1={8} y1={36} x2={6} y2={32} stroke="#FB923C" strokeWidth={1.4} strokeLinecap="round" />
          <Line x1={8} y1={36} x2={6} y2={40} stroke="#FB923C" strokeWidth={1.4} strokeLinecap="round" />
          <Line x1={6} y1={41} x2={52} y2={41} stroke="#F97316" strokeWidth={0.7} opacity={0.3} />
        </Svg>
      );

    case "dhanurasana":
      return (
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <FigureBg id={bgId} accent={accent} />
          <Circle cx={44} cy={18} r={5} stroke="#FB923C" strokeWidth={1.5} fill="none" />
          <Path d="M39 22 Q29 32 20 30 Q14 28 16 22" stroke="#FB923C" strokeWidth={2} strokeLinecap="round" fill="none" />
          <Path d="M20 30 Q22 44 32 44 Q42 44 44 30" stroke="#F97316" strokeWidth={1.8} strokeLinecap="round" fill="none" />
          <Line x1={39} y1={22} x2={44} y2={30} stroke="#EA580C" strokeWidth={1.5} strokeLinecap="round" />
          <Circle cx={44} cy={30} r={2} stroke="#FB923C" strokeWidth={1.2} fill="none" />
        </Svg>
      );

    case "shalabhasana":
      return (
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <FigureBg id={bgId} accent={accent} />
          <Circle cx={46} cy={24} r={5} stroke="#FB923C" strokeWidth={1.5} fill="none" />
          <Line x1={41} y1={27} x2={10} y2={31} stroke="#FB923C" strokeWidth={2} strokeLinecap="round" />
          <Line x1={34} y1={28} x2={32} y2={36} stroke="#EA580C" strokeWidth={1.4} strokeLinecap="round" />
          <Line x1={22} y1={30} x2={20} y2={38} stroke="#EA580C" strokeWidth={1.4} strokeLinecap="round" />
          <Line x1={10} y1={31} x2={8} y2={24} stroke="#F97316" strokeWidth={1.8} strokeLinecap="round" />
          <Line x1={10} y1={31} x2={14} y2={24} stroke="#F97316" strokeWidth={1.8} strokeLinecap="round" />
        </Svg>
      );

    /* ───────── HEADSTAND ───────── */
    case "sirsasana":
      return (
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <FigureBg id={bgId} accent={accent} />
          <Circle cx={29} cy={50} r={5} stroke="#F472B6" strokeWidth={1.5} fill="none" />
          <Line x1={29} y1={45} x2={29} y2={26} stroke="#F472B6" strokeWidth={2} strokeLinecap="round" />
          <Line x1={29} y1={48} x2={18} y2={54} stroke="#DB2777" strokeWidth={1.6} strokeLinecap="round" />
          <Line x1={29} y1={48} x2={40} y2={54} stroke="#DB2777" strokeWidth={1.6} strokeLinecap="round" />
          <Line x1={18} y1={54} x2={40} y2={54} stroke="#EC4899" strokeWidth={1.2} strokeLinecap="round" opacity={0.5} />
          <Line x1={29} y1={26} x2={26} y2={8} stroke="#EC4899" strokeWidth={2} strokeLinecap="round" />
          <Line x1={29} y1={26} x2={32} y2={8} stroke="#EC4899" strokeWidth={2} strokeLinecap="round" />
          <Line x1={29} y1={50} x2={16} y2={46} stroke="#F472B6" strokeWidth={0.8} opacity={0.4} />
          <Line x1={29} y1={50} x2={42} y2={46} stroke="#F472B6" strokeWidth={0.8} opacity={0.4} />
          <Line x1={8} y1={55} x2={50} y2={55} stroke="#EC4899" strokeWidth={0.7} opacity={0.25} />
        </Svg>
      );

    case "supportedheadstand":
      return (
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <FigureBg id={bgId} accent={accent} />
          <Circle cx={29} cy={50} r={5} stroke="#F472B6" strokeWidth={1.5} fill="none" />
          <Line x1={29} y1={45} x2={29} y2={28} stroke="#F472B6" strokeWidth={2} strokeLinecap="round" />
          <Line x1={29} y1={48} x2={16} y2={54} stroke="#DB2777" strokeWidth={1.6} strokeLinecap="round" />
          <Line x1={29} y1={48} x2={42} y2={54} stroke="#DB2777" strokeWidth={1.6} strokeLinecap="round" />
          <Line x1={16} y1={54} x2={42} y2={54} stroke="#EC4899" strokeWidth={1.2} strokeLinecap="round" opacity={0.4} />
          <Line x1={29} y1={28} x2={22} y2={14} stroke="#EC4899" strokeWidth={2} strokeLinecap="round" />
          <Line x1={22} y1={14} x2={18} y2={8} stroke="#BE185D" strokeWidth={1.4} strokeLinecap="round" />
          <Line x1={29} y1={28} x2={36} y2={14} stroke="#EC4899" strokeWidth={2} strokeLinecap="round" />
          <Line x1={36} y1={14} x2={40} y2={8} stroke="#BE185D" strokeWidth={1.4} strokeLinecap="round" />
        </Svg>
      );

    /* ───────── SURYA NAMASKAR ───────── */
    case "suryaA":
      return (
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <Defs>
            <RadialGradient id="surA-bg" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFD700" stopOpacity={0.15} />
              <Stop offset="100%" stopColor="#FFD700" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="surA-sun" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFD700" stopOpacity={0.9} />
              <Stop offset="100%" stopColor="#F97316" stopOpacity={0.5} />
            </RadialGradient>
          </Defs>
          <Rect width={58} height={58} rx={12} fill="url(#surA-bg)" />
          <Circle cx={29} cy={20} r={7} fill="url(#surA-sun)" opacity={0.9} />
          <Line x1={29} y1={10} x2={29} y2={7} stroke="#FFD700" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={29} y1={30} x2={29} y2={33} stroke="#FFD700" strokeWidth={1.5} strokeLinecap="round" opacity={0.5} />
          <Line x1={19} y1={20} x2={16} y2={20} stroke="#FFD700" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={39} y1={20} x2={42} y2={20} stroke="#FFD700" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={22} y1={13} x2={20} y2={11} stroke="#FFD700" strokeWidth={1.2} strokeLinecap="round" />
          <Line x1={36} y1={13} x2={38} y2={11} stroke="#FFD700" strokeWidth={1.2} strokeLinecap="round" />
          <Circle cx={29} cy={36} r={4} stroke="#FCD34D" strokeWidth={1.4} fill="none" />
          <Line x1={29} y1={40} x2={29} y2={50} stroke="#FCD34D" strokeWidth={1.8} strokeLinecap="round" />
          <Line x1={26} y1={42} x2={32} y2={42} stroke="#FCD34D" strokeWidth={1.4} strokeLinecap="round" />
          <Line x1={29} y1={50} x2={24} y2={56} stroke="#FCD34D" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={29} y1={50} x2={34} y2={56} stroke="#FCD34D" strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
      );

    case "suryaB":
      return (
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <Defs>
            <RadialGradient id="surB-bg" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFD700" stopOpacity={0.18} />
              <Stop offset="100%" stopColor="#FFD700" stopOpacity={0} />
            </RadialGradient>
            <RadialGradient id="surB-sun" cx="50%" cy="50%" r="50%">
              <Stop offset="0%" stopColor="#FFD700" stopOpacity={1} />
              <Stop offset="100%" stopColor="#EC4899" stopOpacity={0.6} />
            </RadialGradient>
          </Defs>
          <Rect width={58} height={58} rx={12} fill="url(#surB-bg)" />
          <Circle cx={29} cy={18} r={9} fill="url(#surB-sun)" opacity={0.85} />
          <Line x1={29} y1={7} x2={29} y2={4} stroke="#FFD700" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={18} y1={18} x2={14} y2={18} stroke="#FFD700" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={40} y1={18} x2={44} y2={18} stroke="#FFD700" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={21} y1={10} x2={18} y2={7} stroke="#FFD700" strokeWidth={1.2} strokeLinecap="round" />
          <Line x1={37} y1={10} x2={40} y2={7} stroke="#FFD700" strokeWidth={1.2} strokeLinecap="round" />
          <Line x1={21} y1={26} x2={18} y2={29} stroke="#FFD700" strokeWidth={1.2} strokeLinecap="round" opacity={0.5} />
          <Line x1={37} y1={26} x2={40} y2={29} stroke="#FFD700" strokeWidth={1.2} strokeLinecap="round" opacity={0.5} />
          <Circle cx={29} cy={36} r={3.5} stroke="#FCD34D" strokeWidth={1.3} fill="none" />
          <Line x1={29} y1={39} x2={29} y2={48} stroke="#FCD34D" strokeWidth={1.6} strokeLinecap="round" />
          <Line x1={29} y1={43} x2={20} y2={40} stroke="#FCD34D" strokeWidth={1.3} strokeLinecap="round" />
          <Line x1={29} y1={43} x2={38} y2={40} stroke="#FCD34D" strokeWidth={1.3} strokeLinecap="round" />
          <Line x1={29} y1={48} x2={22} y2={56} stroke="#FCD34D" strokeWidth={1.5} strokeLinecap="round" />
          <Line x1={29} y1={48} x2={38} y2={52} stroke="#FCD34D" strokeWidth={1.5} strokeLinecap="round" />
        </Svg>
      );

    default:
      return (
        <Svg width={58} height={58} viewBox="0 0 58 58">
          <FigureBg id={bgId} accent={accent} />
          <Circle cx={29} cy={29} r={10} stroke={accent} strokeWidth={1.5} fill="none" />
        </Svg>
      );
  }
}
