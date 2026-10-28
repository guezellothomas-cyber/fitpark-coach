import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { exerciceParId } from '../data/exercices';
import type { ExerciceDeSeance } from '../db/types';
import { formatDuree, formatNombre } from '../lib/format';
import { IconeLien, IconePoignee } from './Icones';

interface Props {
  exercices: ExerciceDeSeance[];
  onChange: (exercices: ExerciceDeSeance[]) => void;
  onOuvrir: (index: number) => void;
}

/** "3 × 8-10 · 60 kg · 1:30" */
function resume(e: ExerciceDeSeance): string {
  const reps = e.repsMin === e.repsMax ? `${e.repsMin}` : `${e.repsMin}-${e.repsMax}`;
  const charge = e.charge > 0 ? ` · ${formatNombre(e.charge)} kg` : '';
  return `${e.series} × ${reps}${charge} · repos ${formatDuree(e.repos)}`;
}

/**
 * Liste ordonnée des exercices d'une séance.
 * Réordonner : maintenir la poignée ⋮⋮ et glisser. Superset : le bouton entre deux exercices.
 */
export function ListeExercicesSeance({ exercices, onChange, onOuvrir }: Props) {
  const capteurs = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function finGlisser({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const de = exercices.findIndex((e) => e.exerciceId === active.id);
    const vers = exercices.findIndex((e) => e.exerciceId === over.id);
    onChange(arrayMove(exercices, de, vers));
    navigator.vibrate?.(10);
  }

  function basculerSuperset(index: number) {
    onChange(exercices.map((e, i) => (i === index ? { ...e, supersetAvecSuivant: !e.supersetAvecSuivant } : e)));
  }

  return (
    <DndContext
      sensors={capteurs}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={finGlisser}
    >
      <SortableContext items={exercices.map((e) => e.exerciceId)} strategy={verticalListSortingStrategy}>
        <ol className="liste-seance">
          {exercices.map((e, i) => (
            <ElementSeance
              key={e.exerciceId}
              item={e}
              numero={i + 1}
              lieAuPrecedent={i > 0 && exercices[i - 1]!.supersetAvecSuivant}
              dernier={i === exercices.length - 1}
              onOuvrir={() => onOuvrir(i)}
              onSuperset={() => basculerSuperset(i)}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

interface PropsElement {
  item: ExerciceDeSeance;
  numero: number;
  lieAuPrecedent: boolean;
  dernier: boolean;
  onOuvrir: () => void;
  onSuperset: () => void;
}

function ElementSeance({ item, numero, lieAuPrecedent, dernier, onOuvrir, onSuperset }: PropsElement) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: item.exerciceId,
  });
  const exercice = exerciceParId(item.exerciceId);
  const lie = item.supersetAvecSuivant && !dernier;

  return (
    <li
      ref={setNodeRef}
      className={`element-seance${isDragging ? ' glisse' : ''}${lie ? ' lie' : ''}${lieAuPrecedent ? ' lie-avant' : ''}`}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <div className="carte element-seance-carte">
        <button
          type="button"
          ref={setActivatorNodeRef}
          className="poignee"
          aria-label={`Déplacer ${exercice?.nom ?? ''}`}
          {...attributes}
          {...listeners}
        >
          <IconePoignee taille={22} />
        </button>
        <button type="button" className="element-seance-corps" onClick={onOuvrir}>
          <span className="element-seance-nom">
            <span className="chiffres element-seance-numero">{numero}</span>
            {exercice?.nom ?? item.exerciceId}
          </span>
          <span className="element-seance-resume">{resume(item)}</span>
        </button>
      </div>
      {!dernier && (
        <button
          type="button"
          className="bouton-superset"
          aria-pressed={item.supersetAvecSuivant}
          onClick={onSuperset}
        >
          <IconeLien taille={16} />
          {item.supersetAvecSuivant ? 'En superset' : 'Superset'}
        </button>
      )}
    </li>
  );
}
