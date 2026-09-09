// `inert` is a standard HTML global attribute (widely supported since 2023)
// but missing from this project's @types/react version. The leading
// `import` makes this file an actual module, so the augmentation below
// MERGES with react's real types instead of replacing them.
import "react";

declare module "react" {
  interface HTMLAttributes<T> {
    // pass "" (present) or undefined (absent) — React 18 doesn't know
    // `inert` is a boolean HTML attribute, so a JS boolean triggers a
    // dev-mode warning ("non-boolean attribute").
    inert?: string;
  }
}
