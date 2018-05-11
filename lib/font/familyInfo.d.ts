export declare class FamilyInfo {
    families: string[];
    constructor(families: string[]);
    /**
     * Gets the first font "wf_" font family since it will always be loaded.
     */
    readonly family: string;
    /**
    * Gets the first font family that matches regex (if provided).
    * Default regex looks for "wf_" fonts which are always loaded.
    */
    getFamily(regex?: RegExp): string;
    /**
     * Gets the CSS string for the "font-family" CSS attribute.
     */
    readonly css: string;
    /**
     * Gets the CSS string for the "font-family" CSS attribute.
     */
    getCSS(): string;
}
