/**
 * Animation du geste d'un exercice : un personnage dessiné pour l'app fait le mouvement en boucle
 * (montée rapide, descente lente). L'animation s'arrête quand elle n'est pas visible, et reste
 * figée (position de départ en transparence + position d'arrivée) si l'iPhone demande de réduire
 * les animations.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { GESTES, MOTIFS, type Forme, type Materiel, type Motif } from '../data/gestes';
import {
  AXE,
  completer,
  interpoler,
  progression,
  tete,
  type Point,
  type PoseComplete,
  type Vue,
} from '../lib/cinematique';

const pts = (...p: Point[]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

function useMouvementReduit(): boolean {
  const [reduit] = useState(() => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false);
  return reduit;
}

export function AnimationGeste({
  exerciceId,
  className,
  statique = false,
}: {
  exerciceId: string;
  className?: string;
  /** Image fixe : départ en transparence + arrivée. */
  statique?: boolean;
}) {
  const geste = GESTES[exerciceId];
  const motif = geste ? (MOTIFS[geste.motif] as Motif) : undefined;
  const reduit = useMouvementReduit() || statique;
  const svg = useRef<SVGSVGElement>(null);
  const [t, setT] = useState(reduit ? 1 : 0);

  const [A, B] = useMemo(() => {
    if (!motif || !geste) return [null, null];
    const a = completer(motif.A, motif.vue);
    const b = completer(motif.B, motif.vue);
    return geste.inverse ? [b, a] : [a, b];
  }, [motif, geste]);

  // Boucle d'animation, seulement quand le dessin est à l'écran.
  useEffect(() => {
    const el = svg.current;
    if (reduit || !el) return;
    let image = 0;
    let visible = false;
    const debut = performance.now();
    const tour = (now: number) => {
      setT(progression(now - debut));
      if (visible) image = requestAnimationFrame(tour);
    };
    const observateur = new IntersectionObserver(([entree]) => {
      const etait = visible;
      visible = !!entree?.isIntersecting;
      if (visible && !etait) image = requestAnimationFrame(tour);
      if (!visible) cancelAnimationFrame(image);
    });
    observateur.observe(el);
    return () => {
      observateur.disconnect();
      cancelAnimationFrame(image);
    };
  }, [reduit]);

  if (!motif || !geste || !A || !B) return null;
  const pose = interpoler(A, B, t);
  const haut = hautDuCadre(A, B, motif, geste.materiel);

  return (
    <svg
      ref={svg}
      viewBox={`0 ${haut} 160 ${118 - haut}`}
      className={`geste ${className ?? ''}`}
      role="img"
      aria-label="Animation du mouvement"
    >
      {(motif.decor ?? []).map((f, i) => (
        <FormeDecor key={i} forme={f} />
      ))}
      {motif.sol !== false && <line x1={6} y1={111.5} x2={154} y2={111.5} className="geste-sol" />}
      {geste.materiel === 'smith' && (
        <line x1={(A.M[0] + B.M[0]) / 2} y1={-14} x2={(A.M[0] + B.M[0]) / 2} y2={111} className="geste-rail" />
      )}
      {reduit && <Personnage pose={A} vue={motif.vue} fantome />}
      <Personnage pose={pose} vue={motif.vue} />
      <MaterielDessin materiel={geste.materiel} pose={pose} vue={motif.vue} ancre={motif.ancre} />
    </svg>
  );
}

/**
 * Haut du cadre : on recadre sur la zone réellement utilisée par le geste
 * (un exercice couché n'a pas besoin de la place au-dessus de la tête).
 */
function hautDuCadre(A: PoseComplete, B: PoseComplete, motif: Motif, materiel: Materiel): number {
  const ys: number[] = [];
  for (const p of [A, B]) {
    for (const q of Object.values(p)) ys.push(q[1]);
    ys.push(tete(p, motif.vue)[1] - 8);
  }
  if (motif.ancre && (materiel === 'poulie' || materiel === 'poulie-cheville')) ys.push(motif.ancre[1]);
  if (['barre', 'smith', 'epaule', 'hanches', 'roue'].includes(materiel)) ys.push(Math.min(...ys) - 10);
  for (const f of motif.decor ?? []) {
    if ('rect' in f) ys.push(f.rect[1]);
    else if ('cercle' in f) ys.push(f.cercle[1] - f.cercle[2]);
    else ys.push(Math.min(f.ligne[1], f.ligne[3]));
  }
  // Marge de 6, cadre d'au moins 70 de haut pour garder une taille stable à l'écran.
  return Math.max(-14, Math.min(48, Math.floor(Math.min(...ys) - 6)));
}

function FormeDecor({ forme }: { forme: Forme }) {
  if ('rect' in forme) {
    const [x, y, w, h] = forme.rect;
    return <rect x={x} y={y} width={w} height={h} rx={1.5} className="geste-decor" />;
  }
  if ('cercle' in forme) {
    const [cx, cy, r] = forme.cercle;
    return <circle cx={cx} cy={cy} r={r} className="geste-decor" />;
  }
  const [x1, y1, x2, y2] = forme.ligne;
  return <line x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth={forme.epaisseur ?? 3} className="geste-decor-ligne" />;
}

function Personnage({ pose: p, vue, fantome = false }: { pose: PoseComplete; vue: Vue; fantome?: boolean }) {
  const [tx, ty] = tete(p, vue);
  const cls = fantome ? 'geste-corps fantome' : 'geste-corps';
  if (vue === 'face') {
    return (
      <g className={cls}>
        <polyline points={pts(p.S, p.E, p.M)} strokeWidth={6} />
        <polyline points={pts(p.S2, p.E2, p.M2)} strokeWidth={6} />
        <polyline points={pts(p.H, p.G, p.C, p.O)} strokeWidth={7.5} />
        <polyline points={pts(p.H2, p.G2, p.C2, p.O2)} strokeWidth={7.5} />
        <polygon points={pts(p.S, p.S2, p.H2, p.H)} strokeWidth={6} className="geste-tronc" />
        <line x1={tx} y1={ty} x2={(p.S[0] + p.S2[0]) / 2} y2={(p.S[1] + p.S2[1]) / 2} strokeWidth={6} />
        <circle cx={tx} cy={ty} r={7.5} className="geste-tete" />
      </g>
    );
  }
  return (
    <g className={cls}>
      {/* Membres du fond, plus sombres */}
      <g className="geste-loin">
        <polyline points={pts(p.S2, p.E2, p.M2)} strokeWidth={5.5} />
        <polyline points={pts(p.H2, p.G2, p.C2, p.O2)} strokeWidth={6.5} />
      </g>
      <polyline points={pts(p.H, p.G, p.C, p.O)} strokeWidth={7.5} />
      <line x1={p.H[0]} y1={p.H[1]} x2={p.S[0]} y2={p.S[1]} strokeWidth={11} />
      <circle cx={tx} cy={ty} r={6.5} className="geste-tete" />
      <polyline points={pts(p.S, p.E, p.M)} strokeWidth={6} />
    </g>
  );
}

function MaterielDessin({ materiel, pose: p, vue, ancre }: { materiel: Materiel; pose: PoseComplete; vue: Vue; ancre?: Point }) {
  const face = vue === 'face';
  const miroir = (q: Point): Point => [2 * AXE - q[0], q[1]];
  switch (materiel) {
    case 'barre':
    case 'smith':
      if (face) {
        const y = (p.M[1] + p.M2[1]) / 2;
        return (
          <g className="geste-materiel">
            <line x1={p.M[0] - 16} y1={y} x2={p.M2[0] + 16} y2={y} strokeWidth={2.5} />
            <rect x={p.M[0] - 22} y={y - 8} width={5} height={16} rx={1.5} className="plein" />
            <rect x={p.M2[0] + 17} y={y - 8} width={5} height={16} rx={1.5} className="plein" />
          </g>
        );
      }
      return <Disque c={p.M} r={9} />;
    case 'halteres':
      return (
        <g className="geste-materiel">
          {face ? (
            <>
              <Haltere c={p.M} />
              <Haltere c={p.M2} />
            </>
          ) : (
            <>
              <g opacity={0.5}>
                <Haltere c={p.M2} />
              </g>
              <Haltere c={p.M} />
            </>
          )}
        </g>
      );
    case 'poulie':
      if (!ancre) return null;
      return (
        <g className="geste-materiel">
          <Cable de={p.M} vers={ancre} />
          {face && <Cable de={p.M2} vers={miroir(ancre)} />}
          <circle cx={p.M[0]} cy={p.M[1]} r={2.6} className="plein" />
          {face && <circle cx={p.M2[0]} cy={p.M2[1]} r={2.6} className="plein" />}
        </g>
      );
    case 'poulie-cheville': {
      if (!ancre) return null;
      const cheville = face ? p.C2 : p.C;
      return (
        <g className="geste-materiel">
          <Cable de={cheville} vers={ancre} />
          <circle cx={cheville[0]} cy={cheville[1]} r={3} className="plein" />
        </g>
      );
    }
    case 'machine':
      return (
        <g className="geste-materiel">
          <circle cx={p.M2[0]} cy={p.M2[1]} r={3} className="plein" opacity={face ? 1 : 0.5} />
          <circle cx={p.M[0]} cy={p.M[1]} r={3} className="plein" />
        </g>
      );
    case 'rouleau':
      return (
        <g className="geste-materiel">
          <circle cx={p.C[0]} cy={p.C[1]} r={4.5} />
        </g>
      );
    case 'plateau': {
      const ux = p.C[0] - p.G[0];
      const uy = p.C[1] - p.G[1];
      const l = Math.hypot(ux, uy) || 1;
      const [dx, dy] = [ux / l, uy / l];
      const centre: Point = [p.O[0] + dx * 2, p.O[1] + dy * 2];
      return (
        <g className="geste-materiel">
          <line
            x1={centre[0] - dy * 13}
            y1={centre[1] + dx * 13}
            x2={centre[0] + dy * 13}
            y2={centre[1] - dx * 13}
            strokeWidth={4}
          />
        </g>
      );
    }
    case 'epaule':
      return <Disque c={[p.S[0] - 2, p.S[1] - 1]} r={9} />;
    case 'hanches':
      return <Disque c={[p.H[0], p.H[1] - 9]} r={9} />;
    case 'genoux':
      return (
        <g className="geste-materiel">
          {face ? (
            <>
              <circle cx={p.G[0] - 6} cy={p.G[1]} r={4} />
              <circle cx={p.G2[0] + 6} cy={p.G2[1]} r={4} />
            </>
          ) : (
            <circle cx={p.G[0]} cy={p.G[1] - 7} r={4} />
          )}
        </g>
      );
    case 'roue':
      return <Disque c={p.M} r={6.5} />;
    default:
      return null;
  }
}

function Disque({ c, r }: { c: Point; r: number }) {
  return (
    <g className="geste-materiel">
      <circle cx={c[0]} cy={c[1]} r={r} strokeWidth={3} />
      <circle cx={c[0]} cy={c[1]} r={1.8} className="plein" />
    </g>
  );
}

function Haltere({ c }: { c: Point }) {
  return <rect x={c[0] - 6} y={c[1] - 3} width={12} height={6} rx={2} className="plein" />;
}

function Cable({ de, vers }: { de: Point; vers: Point }) {
  return (
    <>
      <line x1={de[0]} y1={de[1]} x2={vers[0]} y2={vers[1]} className="geste-cable" />
      <circle cx={vers[0]} cy={vers[1]} r={3.5} className="geste-poulie" />
    </>
  );
}
