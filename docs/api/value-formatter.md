# valueFormatter
> The ```valueFormatter``` provides the simplest way to format numbers, strings and dates.

The ```powerbi.extensibility.utils.formatting.valueFormatter``` module provides the following functions, interfaces and classes:

* [IValueFormatter](#ivalueformatter)
  * [format](#ivalueformatterformat)
* [ValueFormatterOptions](#valueformatteroptions)
* [create](#create)

## IValueFormatter

This interface describes public methods and properties of the formatter.

```typescript
interface IValueFormatter {
    format(value: any): string;
    displayUnit?: DisplayUnit;
    options?: ValueFormatterOptions;
}
```

## IValueFormatter.format

This method formats the values.

```typescript
function format(value: any, format?: string, allowFormatBeautification?: boolean): string;
```

### Example

#### The thousand format

```typescript
import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

let iValueFormatter = valueFormatter.create({ value: 1001 });

iValueFormatter.format(5678);

// returns: "5.68K"
```

#### The million format

```typescript
import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

let iValueFormatter = valueFormatter.create({ value: 1e6 });

iValueFormatter.format(1234567890);

// returns: "1234.57M"
```

#### The billion format

```typescript
import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

let iValueFormatter = valueFormatter.create({ value: 1e9 });

iValueFormatter.format(1234567891236);

// returns: 1234.57bn
```

#### The trillion format

```typescript
import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

let iValueFormatter = valueFormatter.create({ value: 1e12 });

iValueFormatter.format(1234567891236);

// returns: 1.23T
```

#### The exponent format

```typescript
import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

let iValueFormatter = valueFormatter.create({ format: "E" });

iValueFormatter.format(1234567891236);

// returns: 1.234568E+012
```

#### The percentage format

```typescript
import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

let iValueFormatter = valueFormatter.create({ format: "0.00 %;-0.00 %;0.00 %" });

iValueFormatter.format(0.54);

// returns: 54.00 %
```

#### The dates format

```typescript
import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

let date = new Date(2016, 10, 28, 15, 36, 0),
    iValueFormatter = valueFormatter.create({});

iValueFormatter.format(date);

// returns: 11/28/2016 3:36:00 PM
```

#### The boolean format

```typescript
import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

let iValueFormatter = valueFormatter.create({});

iValueFormatter.format(true);

// returns: True
```

#### The customized precision

```typescript
import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

let iValueFormatter = valueFormatter.create({ value: 0, precision: 3 });

iValueFormatter.format(3.141592653589793);

// returns: 3.142
```

## ValueFormatterOptions

This interface describes options of the IValueFormatter.

```typescript
interface ValueFormatterOptions {
    /** The format string to use. */
    format?: string;
    /** The data value. */
    value?: any;
    /** The data value. */
    value2?: any;
    /** The number of ticks. */
    tickCount?: any;
    /** The display unit system to use */
    displayUnitSystemType?: DisplayUnitSystemType;
    /** True if we are formatting single values in isolation (e.g. card), as opposed to multiple values with a common base (e.g. chart axes) */
    formatSingleValues?: boolean;
    /** True if we want to trim off unnecessary zeroes after the decimal and remove a space before the % symbol */
    allowFormatBeautification?: boolean;
    /** Specifies the maximum number of decimal places to show */
    precision?: number;
    /** Detect axis precision based on value */
    detectAxisPrecision?: boolean;
    /** Specifies the column type of the data value */
    columnType?: ValueTypeDescriptor;
}
```

## create

This method creates an instance of IValueFormatter.

```typescript
function create(options: ValueFormatterOptions): IValueFormatter;
```

### Example

```typescript
import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;

valueFormatter.create({});

// returns: an instance of IValueFormatter.
```
