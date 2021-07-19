import { Observable } from 'rxjs';
import { Accessor, createSignal, onCleanup } from 'solid-js';

export function observableToAccessor<T>(o$: Observable<T>, defaultValue: T): Accessor<T> {
  const [value, setValue] = createSignal<T>(defaultValue);

  const sub = o$.subscribe(v => {
    setValue(() => v);
  });

  onCleanup(() => {
    sub.unsubscribe();
  });

  return value;
}
