export interface FormattingOptions {
    value: number;
    nonScientificFormat: string;
    cultureSelector: string;
    format: string;
    decimals?: number;
    trailingZeros?: boolean;
}
export declare class DisplayUnit {
    value: number;
    title: string;
    labelFormat: string;
    applicableRangeMin: number;
    applicableRangeMax: number;
    project(value: number): number;
    reverseProject(value: number): number;
    isApplicableTo(value: number): boolean;
    isScaling(): boolean;
}
export declare class DisplayUnitSystem {
    units: DisplayUnit[];
    displayUnit: DisplayUnit;
    private unitBaseValue;
    protected static UNSUPPORTED_FORMATS: RegExp;
    constructor(units?: DisplayUnit[]);
    readonly title: string;
    update(value: number): void;
    private findApplicableDisplayUnit(value);
    format(value: number, format: string, decimals?: number, trailingZeros?: boolean, cultureSelector?: string): string;
    isFormatSupported(format: string): boolean;
    isPercentageFormat(format: string): boolean;
    shouldRespectScalingUnit(format: string): boolean;
    getNumberOfDecimalsForFormatting(format: string, decimals?: number): number;
    isScalingUnit(): boolean;
    private formatHelper(options);
    /** Formats a single value by choosing an appropriate base for the DisplayUnitSystem before formatting. */
    formatSingleValue(value: number, format: string, decimals?: number, trailingZeros?: boolean, cultureSelector?: string): string;
    private shouldUseValuePrecision(value);
    protected isScientific(value: number): boolean;
    protected hasScientitifcFormat(format: string): boolean;
    protected supportsScientificFormat(format: string): boolean;
    protected shouldFallbackToScientific(value: number, format: string): boolean;
    protected getScientificFormat(data: number, format: string, decimals: number, trailingZeros: boolean): string;
}
/** Provides a unit system that is defined by formatting in the model, and is suitable for visualizations shown in single number visuals in explore mode. */
export declare class NoDisplayUnitSystem extends DisplayUnitSystem {
    constructor();
}
/** Provides a unit system that creates a more concise format for displaying values. This is suitable for most of the cases where
    we are showing values (chart axes) and as such it is the default unit system. */
export declare class DefaultDisplayUnitSystem extends DisplayUnitSystem {
    private static units;
    constructor(unitLookup: (exponent: number) => DisplayUnitSystemNames);
    format(data: number, format: string, decimals?: number, trailingZeros?: boolean, cultureSelector?: string): string;
    static reset(): void;
    private static getUnits(unitLookup);
}
/** Provides a unit system that creates a more concise format for displaying values, but only allows showing a unit if we have at least
    one of those units (e.g. 0.9M is not allowed since it's less than 1 million). This is suitable for cases such as dashboard tiles
    where we have restricted space but do not want to show partial units. */
export declare class WholeUnitsDisplayUnitSystem extends DisplayUnitSystem {
    private static units;
    constructor(unitLookup: (exponent: number) => DisplayUnitSystemNames);
    static reset(): void;
    private static getUnits(unitLookup);
    format(data: number, format: string, decimals?: number, trailingZeros?: boolean, cultureSelector?: string): string;
}
export declare class DataLabelsDisplayUnitSystem extends DisplayUnitSystem {
    private static AUTO_DISPLAYUNIT_VALUE;
    private static NONE_DISPLAYUNIT_VALUE;
    protected static UNSUPPORTED_FORMATS: RegExp;
    private static units;
    constructor(unitLookup: (exponent: number) => DisplayUnitSystemNames);
    isFormatSupported(format: string): boolean;
    private static getUnits(unitLookup);
    format(data: number, format: string, decimals?: number, trailingZeros?: boolean, cultureSelector?: string): string;
}
export interface DisplayUnitSystemNames {
    title: string;
    format: string;
}
