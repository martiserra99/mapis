import { Values, Narrow } from "./utility-types";

type Mapper<
  T,
  U extends string[],
  V extends string[],
  W extends unknown[],
  X
> = Values<T, [...U, ...V]> extends string
  ? { [K in Values<T, [...U, ...V]>]: Callback<Narrow<T, U, V, K>, W, X> }
  : never;

type Callback<T, U extends unknown[], V> = (value: T, ...args: U) => V;

/**
 * This utility function is used to map a value to a corresponding function based on the type of the value.
 *
 * @template T The type we are dealing with.
 * @template U The path to the key that we want to narrow down.
 * @template V The path to the discriminator key used to extract the subset.
 * @template W The extra parameters of the returned function.
 * @template X The return type of the returned function.
 *
 * @param reduce The path to the key that we want to narrow down.
 * @param subset The path to the discriminator key used to extract the subset.
 * @param mapper The mapper object with the keys and the corresponding functions.
 *
 * @returns A function that maps a value to a corresponding function based on the type of the value.
 */
export function mapis<
  T,
  U extends string[],
  V extends string[],
  W extends unknown[],
  X
>(
  reduce: U,
  subset: V,
  mapper: Mapper<T, U, V, W, X>
): (value: T, ...args: W) => X {
  return (value: T, ...args: W): X => {
    const path: string[] = [...reduce, ...subset];
    const key = path.reduce((acc, key) => {
      const object = acc as object;
      const property = key as keyof typeof object;
      return object[property];
    }, value) as keyof typeof mapper;
    const callback = mapper[key] as Callback<Narrow<T, U, V, typeof key>, W, X>;
    return callback(value as Narrow<T, U, V, typeof key>, ...args);
  };
}

export { Mapper, Narrow };
