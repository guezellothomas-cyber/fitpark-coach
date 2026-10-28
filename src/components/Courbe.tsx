import { useRef, useState, type PointerEvent } from 'react';
import { formatNombre } from '../lib/format';

export interface PointCourbe {
  /** Date (horodatage). */
  x: number;
  y: number;
}

interface Props {
  points: readonly PointCourbe[];
  unite: string;
  /** Description pour les lecteurs d'écran. */
  titre: string;
  format?: (y: number) => string;
}

// Repère interne du dessin
const L = 320;
const H = 150;
const MARGE = { gauche: 38, droite: 14, haut: 14, bas: 24 };

const dateCourte = (t: number) => new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
const dateLongue = (t: number) => new Date(t).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long' });

/**
 * Courbe d'évolution d'une seule mesure dans le temps.
 * Poser le doigt (ou la souris) sur la courbe affiche la date et la valeur exactes.
 */
export function Courbe({ points, unite, titre, format = formatNombre }: Props) {
  const zone = useRef<HTMLDivElement>(null);
  const [actif, setActif] = useState<number | null>(null);

  if (points.length === 0) return null;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  let yMin = Math.min(...ys);
  let yMax = Math.max(...ys);
  const marge = (yMax - yMin) * 0.12 || Math.max(1, yMax * 0.05);
  yMin = Math.max(0, yMin - marge);
  yMax = yMax + marge;

  const px = (x: number) =>
    xMax === xMin ? (MARGE.gauche + L - MARGE.droite) / 2 : MARGE.gauche + ((x - xMin) / (xMax - xMin)) * (L - MARGE.gauche - MARGE.droite);
  const py = (y: number) => MARGE.haut + (1 - (y - yMin) / (yMax - yMin)) * (H - MARGE.haut - MARGE.bas);

  const trace = points.map((p, i) => `${i ? 'L' : 'M'}${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(' ');
  const graduations = [yMin, (yMin + yMax) / 2, yMax];
  const dernier = points.length - 1;

  // Point le plus proche du doigt, horizontalement.
  function viser(e: PointerEvent<HTMLDivElement>) {
    const boite = zone.current?.getBoundingClientRect();
    if (!boite) return;
    const x = ((e.clientX - boite.left) / boite.width) * L;
    let meilleur = 0;
    points.forEach((p, i) => {
      if (Math.abs(px(p.x) - x) < Math.abs(px(points[meilleur]!.x) - x)) meilleur = i;
    });
    setActif(meilleur);
  }

  const pointActif = actif !== null ? points[actif] : undefined;

  return (
    <div className="courbe">
      <div
        ref={zone}
        className="courbe-zone"
        onPointerDown={viser}
        onPointerMove={(e) => (e.pointerType === 'mouse' || e.buttons) && viser(e)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setActif(null)}
      >
        <svg viewBox={`0 0 ${L} ${H}`} role="img" aria-label={titre}>
          {graduations.map((g, i) => (
            <g key={i}>
              <line x1={MARGE.gauche} x2={L - MARGE.droite} y1={py(g)} y2={py(g)} className="courbe-grille" />
              <text x={MARGE.gauche - 6} y={py(g) + 3.5} className="courbe-axe" textAnchor="end">
                {/* Graduations arrondies : entières dès que l'écart dépasse 10 */}
                {format(yMax - yMin >= 10 ? Math.round(g) : Math.round(g * 10) / 10)}
              </text>
            </g>
          ))}
          <text x={MARGE.gauche} y={H - 6} className="courbe-axe">
            {dateCourte(xMin)}
          </text>
          {xMax !== xMin && (
            <text x={L - MARGE.droite} y={H - 6} className="courbe-axe" textAnchor="end">
              {dateCourte(xMax)}
            </text>
          )}

          {pointActif && (
            <line x1={px(pointActif.x)} x2={px(pointActif.x)} y1={MARGE.haut} y2={H - MARGE.bas} className="courbe-repere" />
          )}

          <path d={trace} className="courbe-ligne" />
          {points.map((p, i) =>
            points.length <= 24 || i === dernier || i === actif ? (
              <circle
                key={i}
                cx={px(p.x)}
                cy={py(p.y)}
                r={i === actif ? 5 : 4}
                className={`courbe-point${i === actif ? ' actif' : ''}`}
              />
            ) : null,
          )}
          {/* Étiquette directe sur la dernière valeur seulement */}
          {actif === null && (
            <text x={px(points[dernier]!.x)} y={py(points[dernier]!.y) - 9} className="courbe-etiquette" textAnchor="end">
              {format(points[dernier]!.y)} {unite}
            </text>
          )}
        </svg>

        {pointActif && (
          <div
            className="courbe-bulle"
            style={{ left: `${Math.min(78, Math.max(22, (px(pointActif.x) / L) * 100))}%` }}
          >
            <strong className="chiffres">
              {format(pointActif.y)} {unite}
            </strong>
            <span>{dateLongue(pointActif.x)}</span>
          </div>
        )}
      </div>

      <details className="courbe-tableau">
        <summary>Voir les valeurs</summary>
        <table>
          <tbody>
            {[...points].reverse().map((p, i) => (
              <tr key={i}>
                <td>{dateLongue(p.x)}</td>
                <td className="chiffres">
                  {format(p.y)} {unite}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
