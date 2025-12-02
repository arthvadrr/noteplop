import { createContext, useState, useMemo, useContext } from 'react';
import type { ReactNode } from 'react';
import type {
  Score,
  Track,
  Measure,
  PlacedNote,
  Clef,
  TimeSignature,
} from './ScoreContext.types';

/**
 * ID generation
 */
let idCounter = 0;

function generateId(prefix: string): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Context value interface
 */
interface ScoreContextValue {
  // State
  scores: Score[];
  activeScoreId: string | null;
  activeTrackId: string | null;
  activeMeasureId: string | null;

  // Computed values
  activeScore: Score | null;
  activeTrack: Track | null;
  activeMeasure: Measure | null;

  // Score actions
  createScore: (title: string) => string;
  deleteScore: (scoreId: string) => void;
  setActiveScore: (scoreId: string) => void;

  // Track actions
  addTrack: (scoreId: string, name: string, clef: Clef) => string;
  deleteTrack: (scoreId: string, trackId: string) => void;
  setActiveTrack: (trackId: string) => void;

  // Measure actions
  addMeasure: (trackId: string, timeSignature: TimeSignature) => string;
  deleteMeasure: (trackId: string, measureId: string) => void;
  setActiveMeasure: (measureId: string) => void;
  updateMeasureTimeSignature: (measureId: string, timeSignature: TimeSignature) => void;
  updateMeasureClef: (measureId: string, clef: Clef) => void;

  // Note actions
  addNote: (measureId: string, note: Omit<PlacedNote, 'id'>) => string;
  updateNote: (
    measureId: string,
    noteId: string,
    updates: Partial<Omit<PlacedNote, 'id'>>
  ) => void;
  deleteNote: (measureId: string, noteId: string) => void;
}

/**
 * Create context
 */
const ScoreContext = createContext<ScoreContextValue | null>(null);

/**
 * Provider component
 * Initialize with a default score, track, and measure
 */
export function ScoreProvider({ children }: { children: ReactNode }): ReactNode {
  const [scores, setScores] = useState<Score[]>(() => {
    const defaultMeasureId = generateId('measure');
    const defaultTrackId = generateId('track');
    const defaultScoreId = generateId('score');

    return [
      {
        id: defaultScoreId,
        title: 'Untitled Score',
        tracks: [
          {
            id: defaultTrackId,
            name: 'Piano',
            clef: 'treble',
            measures: [
              {
                id: defaultMeasureId,
                number: 1,
                timeSignature: '4/4',
                notes: [],
              },
            ],
          },
        ],
      },
    ];
  });

  /**
   * Track which score/track/measure is currently active (what the user is editing)
   * Stored as IDs to prevent stale references when scores array updates
   * Initialized to the default score/track/measure created above
   */
  const [activeScoreId, setActiveScoreId] = useState<string | null>(
    () => scores[0]?.id ?? null
  );
  const [activeTrackId, setActiveTrackId] = useState<string | null>(
    () => scores[0]?.tracks[0]?.id ?? null
  );
  const [activeMeasureId, setActiveMeasureId] = useState<string | null>(
    () => scores[0]?.tracks[0]?.measures[0]?.id ?? null
  );

  /**
   * Computed values - actual objects looked up by their IDs
   * Using useMemo to cache results and only recalculate when dependencies change
   * Prevents unnecessary .find() operations on every render (e.g. during drag animations)
   */
  const activeScore = useMemo(
    () => scores.find((s) => s.id === activeScoreId) ?? null,
    [scores, activeScoreId]
  );

  const activeTrack = useMemo(
    () => activeScore?.tracks.find((t) => t.id === activeTrackId) ?? null,
    [activeScore, activeTrackId]
  );

  const activeMeasure = useMemo(
    () => activeTrack?.measures.find((m) => m.id === activeMeasureId) ?? null,
    [activeTrack, activeMeasureId]
  );


  /**
   * Score actions
   */
  function createScore(title: string): string {
    const scoreId = generateId('score');
    const trackId = generateId('track');
    const measureId = generateId('measure');

    const newScore: Score = {
      id: scoreId,
      title,
      tracks: [
        {
          id: trackId,
          name: 'Track 1',
          clef: 'treble',
          measures: [
            {
              id: measureId,
              number: 1,
              timeSignature: '4/4',
              notes: [],
            },
          ],
        },
      ],
    };

    setScores((prev) => [...prev, newScore]);

    return scoreId;
  }

  function deleteScore(scoreId: string): void {
    setScores((prev) => prev.filter((s) => s.id !== scoreId));
    if (activeScoreId === scoreId) {
      setActiveScoreId(null);
      setActiveTrackId(null);
      setActiveMeasureId(null);
    }
  }

  /**
   * Track actions
   */
  function addTrack(scoreId: string, name: string, clef: Clef): string {
    const trackId = generateId('track');
    const measureId = generateId('measure');

    setScores((prev) =>
      prev.map((score) =>
        score.id === scoreId
          ? {
            ...score,
            tracks: [
              ...score.tracks,
              {
                id: trackId,
                name,
                clef,
                measures: [
                  {
                    id: measureId,
                    number: 1,
                    timeSignature: '4/4',
                    notes: [],
                  },
                ],
              },
            ],
          }
          : score
      )
    );

    return trackId;
  }

  function deleteTrack(scoreId: string, trackId: string): void {
    setScores((prev) =>
      prev.map((score) =>
        score.id === scoreId
          ? { ...score, tracks: score.tracks.filter((t) => t.id !== trackId) }
          : score
      )
    );

    if (activeTrackId === trackId) {
      setActiveTrackId(null);
      setActiveMeasureId(null);
    }
  }

  /**
   * Measure actions
   */
  function addMeasure(trackId: string, timeSignature: TimeSignature): string {
    const measureId = generateId('measure');

    setScores((prev) =>
      prev.map((score) => ({
        ...score,
        tracks: score.tracks.map((track) => {
          if (track.id !== trackId) return track;

          const newMeasureNumber = track.measures.length + 1;

          return {
            ...track,
            measures: [
              ...track.measures,
              {
                id: measureId,
                number: newMeasureNumber,
                timeSignature,
                notes: [],
              },
            ],
          };
        }),
      }))
    );

    return measureId;
  }

  function deleteMeasure(trackId: string, measureId: string): void {
    setScores((prev) =>
      prev.map((score) => ({
        ...score,
        tracks: score.tracks.map((track) =>
          track.id === trackId
            ? {
              ...track,
              measures: track.measures
                .filter((m) => m.id !== measureId)
                .map((m, index) => ({ ...m, number: index + 1 })),
            }
            : track
        ),
      }))
    );

    if (activeMeasureId === measureId) {
      setActiveMeasureId(null);
    }
  }

  function updateMeasureTimeSignature(measureId: string, timeSignature: TimeSignature): void {
    setScores((prev) =>
      prev.map((score) => ({
        ...score,
        tracks: score.tracks.map((track) => ({
          ...track,
          measures: track.measures.map((measure) =>
            measure.id === measureId ? { ...measure, timeSignature } : measure
          ),
        })),
      }))
    );
  }

  function updateMeasureClef(measureId: string, clef: Clef): void {
    setScores((prev) =>
      prev.map((score) => ({
        ...score,
        tracks: score.tracks.map((track) => ({
          ...track,
          measures: track.measures.map((measure) =>
            measure.id === measureId ? { ...measure, clef } : measure
          ),
        })),
      }))
    );
  }

  /**
   * Note actions
   */
  function addNote(measureId: string, note: Omit<PlacedNote, 'id'>): string {
    const noteId = generateId('note');

    setScores((prev) =>
      prev.map((score) => ({
        ...score,
        tracks: score.tracks.map((track) => ({
          ...track,
          measures: track.measures.map((measure) =>
            measure.id === measureId
              ? { ...measure, notes: [...measure.notes, { ...note, id: noteId }] }
              : measure
          ),
        })),
      }))
    );

    return noteId;
  }

  function updateNote(
    measureId: string,
    noteId: string,
    updates: Partial<Omit<PlacedNote, 'id'>>
  ): void {
    setScores((prev) =>
      prev.map((score) => ({
        ...score,
        tracks: score.tracks.map((track) => ({
          ...track,
          measures: track.measures.map((measure) =>
            measure.id === measureId
              ? {
                ...measure,
                notes: measure.notes.map((note) =>
                  note.id === noteId ? { ...note, ...updates } : note
                ),
              }
              : measure
          ),
        })),
      }))
    );
  }

  function deleteNote(measureId: string, noteId: string): void {
    setScores((prev) =>
      prev.map((score) => ({
        ...score,
        tracks: score.tracks.map((track) => ({
          ...track,
          measures: track.measures.map((measure) =>
            measure.id === measureId
              ? { ...measure, notes: measure.notes.filter((n) => n.id !== noteId) }
              : measure
          ),
        })),
      }))
    );
  }

  const value: ScoreContextValue = {
    scores,
    activeScoreId,
    activeTrackId,
    activeMeasureId,
    activeScore,
    activeTrack,
    activeMeasure,
    createScore,
    deleteScore,
    setActiveScore: setActiveScoreId,
    addTrack,
    deleteTrack,
    setActiveTrack: setActiveTrackId,
    addMeasure,
    deleteMeasure,
    setActiveMeasure: setActiveMeasureId,
    updateMeasureTimeSignature,
    updateMeasureClef,
    addNote,
    updateNote,
    deleteNote,
  };

  return <ScoreContext.Provider value={value}>{children}</ScoreContext.Provider>;
}

/**
 * Hook to use the score context
 */
export function useScore(): ScoreContextValue {
  const context = useContext(ScoreContext);

  if (!context) {
    throw new Error('useScore must be used within a ScoreProvider');
  }

  return context;
}
