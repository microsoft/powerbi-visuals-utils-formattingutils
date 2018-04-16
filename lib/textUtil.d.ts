/**
 * Contains functions/constants to aid in text manupilation.
 */
/**
 * Remove breaking spaces from given string and replace by none breaking space (&nbsp).
 */
export declare function removeBreakingSpaces(str: string): string;
/**
 * Remove ellipses from a given string
 */
export declare function removeEllipses(str: string): string;
/**
* Replace every whitespace (0x20) with Non-Breaking Space (0xA0)
    * @param {string} txt String to replace White spaces
    * @returns Text after replcing white spaces
    */
export declare function replaceSpaceWithNBSP(txt: string): string;
