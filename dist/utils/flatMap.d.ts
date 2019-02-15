/**
 * Maps a list to another list by combining lists.
 */
export default function flatMap<T, U>(list: Array<T>, map: (element: T) => Array<U>): Array<U>;
