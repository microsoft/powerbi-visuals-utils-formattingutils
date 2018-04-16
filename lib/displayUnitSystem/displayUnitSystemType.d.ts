/** The system used to determine display units used during formatting */
export declare enum DisplayUnitSystemType {
    /** Default display unit system, which saves space by using units such as K, M, bn with PowerView rules for when to pick a unit. Suitable for chart axes. */
    Default = 0,
    /** A verbose display unit system that will only respect the formatting defined in the model. Suitable for explore mode single-value cards. */
    Verbose = 1,
    /**
     * A display unit system that uses units such as K, M, bn if we have at least one of those units (e.g. 0.9M is not valid as it's less than 1 million).
     * Suitable for dashboard tile cards
     */
    WholeUnits = 2,
    /**A display unit system that also contains Auto and None units for data labels*/
    DataLabels = 3,
}
