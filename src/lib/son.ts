/**
 * Son court de fin de repos, fabriqué par le navigateur (aucun fichier à télécharger).
 * Sur iPhone, le son doit être "déverrouillé" par un geste de l'utilisateur :
 * on le fait à chaque validation de série. Le bouton silencieux de l'iPhone coupe ce son.
 */
let contexte: AudioContext | null = null;

/** À appeler pendant un appui de l'utilisateur. */
export function deverrouillerSon(): void {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    contexte ??= new Ctx();
    if (contexte.state !== 'running') void contexte.resume();
    // Un son vide joué pendant le geste suffit à autoriser les sons suivants.
    const vide = contexte.createBuffer(1, 1, 22050);
    const source = contexte.createBufferSource();
    source.buffer = vide;
    source.connect(contexte.destination);
    source.start();
  } catch {
    // Pas de son disponible : l'alerte visuelle suffit.
  }
}

/** Trois bips courts et montants. */
export function bipFinRepos(): void {
  if (!contexte) return;
  try {
    if (contexte.state !== 'running') void contexte.resume();
    const t0 = contexte.currentTime + 0.02;
    [0, 0.18, 0.36].forEach((decalage, i) => {
      const osc = contexte!.createOscillator();
      const gain = contexte!.createGain();
      osc.type = 'sine';
      osc.frequency.value = 784 + i * 196;
      gain.gain.setValueAtTime(0.0001, t0 + decalage);
      gain.gain.exponentialRampToValueAtTime(0.35, t0 + decalage + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + decalage + 0.14);
      osc.connect(gain).connect(contexte!.destination);
      osc.start(t0 + decalage);
      osc.stop(t0 + decalage + 0.16);
    });
  } catch {
    // ignoré
  }
}
