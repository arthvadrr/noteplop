import type { PlacedNote } from '../../contexts/ScoreContext/ScoreContext.types';

/**
 * Groups notes into beam groups based on their position and duration
 * Notes are grouped if they are consecutive eighth or sixteenth notes
 */
export function groupNotesForBeaming(notes: PlacedNote[]): PlacedNote[][] {
  // Sort notes by X position (time order)
  const sortedNotes = [...notes].sort((a, b) => a.x - b.x);

  const beamGroups: PlacedNote[][] = [];
  let currentGroup: PlacedNote[] = [];

  for (const note of sortedNotes) {
    const isBeamable = note.duration === 'eighth' || note.duration === 'sixteenth';

    if (!isBeamable) {
      // End current group if we hit a non-beamable note
      if (currentGroup.length >= 2) {
        beamGroups.push(currentGroup);
      }
      currentGroup = [];
      continue;
    }

    if (currentGroup.length === 0) {
      // Start new group
      currentGroup.push(note);
    } else {
      const lastNote = currentGroup[currentGroup.length - 1];
      const xDistance = note.x - lastNote.x;
      
      // Group notes that are close together (within ~2 grid spaces)
      // This prevents beaming notes that are far apart
      const MAX_BEAM_DISTANCE = 70; // Approximately 2 sixteenth note positions
      
      if (xDistance <= MAX_BEAM_DISTANCE) {
        currentGroup.push(note);
      } else {
        // Distance too large, end current group and start new one
        if (currentGroup.length >= 2) {
          beamGroups.push(currentGroup);
        }
        currentGroup = [note];
      }
    }
  }

  // Don't forget the last group
  if (currentGroup.length >= 2) {
    beamGroups.push(currentGroup);
  }

  return beamGroups;
}

/**
 * Returns notes that should NOT be beamed (rendered individually)
 */
export function getUnbeamedNotes(notes: PlacedNote[], beamGroups: PlacedNote[][]): PlacedNote[] {
  const beamedNoteIds = new Set(
    beamGroups.flat().map(note => note.id)
  );

  return notes.filter(note => !beamedNoteIds.has(note.id));
}
