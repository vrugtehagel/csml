/** The context object passed to transforms. */
export interface TransformContext {
	/**
	 * Checks whether the current text node has a certain parent tag, either
	 * direct parents or any of its grandparents.
	 * 
	 * @param name The tagname for the parent to look for.
	 * @returns `true` if the given tag name exists among any of the parents of
	 *          the text node being processed, `false` otherwise.
	 */
	hasParent(name: string): boolean;

	/**
	 * Checks whether the current text node has a certain flag enabled, because
	 * it is either used on its direct parent, or any of its grandparents.
	 * 
	 * @param name The flag name for the parent to look for. This may or may
	 *             not include the colon that comes with a flag, either works.
	 * @returns `true` if the given flag exists among any of the parents of the
	 *          text node being processed. `false` otherwise.
	 */
	hasFlag(name: string): boolean;

	/**
	 * Retrieves the argument passed to the flag used on the closest parent of
	 * a certain text node, as a string.
	 * 
	 * @param name The name of the flag to retrieve. If multiple flags exist
	 *             among the parents, the _last_ one will be used.
	 * @returns If the flag does not exist among any of the text node's
	 *          parents, this returns `null`; if it is used, but does not have
	 *          an argument specified (e.g. `:flag`), the empty string is
	 *          returned; otherwise, the argument is returned.
	 */
	getFlag(name: string): null | string;
}

/** The callback used to define flags and other transforms. */
export interface Transform {
    (text: string, context: TransformContext): string | null | undefined;
}

/** The type of the optional third argument to `addFlag`. */
export interface FlagTransformOptions {
    /**
     * When set to `true`, will only apply the transform if the flag is _not_
     * present. Otherwise, the transform is applied only when one of the text
     * node's parents has the given flag.
     * 
     * @default {false}
     */
    invert?: boolean;

    /**
     * When set to `true`, switches the parser into consuming all children as
     * plain text.
     * 
     * @default {false}
     */
    preformatted?: boolean;
}
