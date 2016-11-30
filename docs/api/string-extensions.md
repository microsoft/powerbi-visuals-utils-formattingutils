# stringExtensions
> The ```stringExtensions``` provides functions in order to simplify manipulations with text and strings.

The ```powerbi.extensibility.utils.formatting.stringExtensions``` module provides the following functions:

* [endsWith](#endswith)
* [equalIgnoreCase](#equalignorecase)
* [startsWith](#startswith)
* [contains](#contains)
* [isNullOrEmpty](#isnullorempty)

## endsWith

This function checks if a string ends with a substring.

```typescript
function endsWith(str: string, suffix: string): boolean;
```

### Example

```typescript
import stringExtensions = powerbi.extensibility.utils.formatting.stringExtensions;

stringExtensions.endsWith("Power BI", "BI");

// returns: true
```

## equalIgnoreCase

This function compares strings, ignoring case.

```typescript
function equalIgnoreCase(a: string, b: string): boolean;
```

### Example

```typescript
import stringExtensions = powerbi.extensibility.utils.formatting.stringExtensions;

stringExtensions.equalIgnoreCase("Power BI", "power bi");

// returns: true
```

## startsWith

This function checks if a string starts with a substring;

```typescript
function startsWith(a: string, b: string): boolean;
```

### Example

```typescript
import stringExtensions = powerbi.extensibility.utils.formatting.stringExtensions;

stringExtensions.startsWith("Power BI", "Power");

// returns: true
```

## contains

This function checks if a string contains a specified substring.

```typescript
function contains(source: string, substring: string): boolean;
```

### Example

```typescript
import stringExtensions = powerbi.extensibility.utils.formatting.stringExtensions;

stringExtensions.contains("Microsoft Power BI Visuals", "Power BI");

// returns: true
```

## isNullOrEmpty

Checks if a string is null or undefined or empty.

```typescript
function isNullOrEmpty(value: string): boolean;
```

### Example

```typescript
import stringExtensions = powerbi.extensibility.utils.formatting.stringExtensions;

stringExtensions.isNullOrEmpty(null);

// returns: true
```
