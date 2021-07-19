import { equals, mapObjIndexed, sortBy, take } from 'ramda';
import { of, Observable, map, combineLatest, scan, distinctUntilChanged } from 'rxjs';
import { CHROMATIC_SCALE, INDEXED_CHROMATIC_SCALE, Note } from './notes';

type ScanNotesConfig = {
  playedNote$: Observable<Note>;
  maximumNotes$?: Observable<number>; // default to heptatonic (7 notes)
};

// last played notes timestamps (for each notes)
type TimedNotesMap = Record<Note, number>;

const DEFAULT_TIMED_NOTES_MAP: TimedNotesMap = mapObjIndexed(() => 0, INDEXED_CHROMATIC_SCALE);

const observeTimedNotesMap = (playedNote$: Observable<Note>): Observable<TimedNotesMap> => {
  return playedNote$.pipe(
    scan((notesMap, note) => {
      return {
        ...notesMap,
        [note]: Date.now(),
      };
    }, DEFAULT_TIMED_NOTES_MAP),
  );
};

const getScannedNotes = (timedNotesMap: TimedNotesMap, maximumNotes: number): Note[] => {
  const notesWithDate = CHROMATIC_SCALE.map(note => {
    void note;
    return { note, date: timedNotesMap[note] };
  });

  const sortedNotes = sortBy(({ date }) => -date, notesWithDate)
    .filter(({ date }) => Boolean(date))
    .map(({ note }) => note);

  return sortBy(x => x, take(maximumNotes, sortedNotes));
};

export const observeScannedNotes = (config: ScanNotesConfig): Observable<Note[]> => {
  const maximumNotes$ = config.maximumNotes$ ?? of(7); // heptatonic scale by default
  const timedNotesMap$ = observeTimedNotesMap(config.playedNote$);

  const scannedNotes$ = combineLatest([timedNotesMap$, maximumNotes$]).pipe(
    map(([notesMap, maxNotes]) => getScannedNotes(notesMap, maxNotes)),
  );

  return scannedNotes$.pipe(distinctUntilChanged((a, b) => equals(a, b)));
};

// const sub = observeScannedNotes({
//   playedNote$: observePlayedNotes().pipe(
//     filter(isNoteEvent),
//     map(({ payload }) => payload),
//   ),
// }).subscribe(console.log);
