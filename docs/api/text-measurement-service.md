# textMeasurementService
> The ```textMeasurementService``` provides some special capabilities in order to get text properties such as ```width```, ```height```, ```font-size```, and so on.

The ```powerbi.extensibility.utils.formatting.textMeasurementService``` module provides the following functions and interfaces:

* [TextProperties](#textproperties)
* [measureSvgTextWidth](#measuresvgtextwidth)
* [measureSvgTextRect](#measuresvgtextrect)
* [measureSvgTextHeight](#measuresvgtextheight)
* [estimateSvgTextBaselineDelta](#estimatesvgtextbaselinedelta)
* [estimateSvgTextHeight](#estimatesvgtextheight)
* [measureSvgTextElementWidth](#measuresvgtextelementwidth)
* [getMeasurementProperties](#getmeasurementproperties)
* [getSvgMeasurementProperties](#getsvgmeasurementproperties)
* [getDivElementWidth](#getdivelementwidth)
* [getTailoredTextOrDefault](#gettailoredtextordefault)

## TextProperties

This interface describes common properties of the text.

```typescript
interface TextProperties {
    text?: string;
    fontFamily: string;
    fontSize: string;
    fontWeight?: string;
    fontStyle?: string;
    fontVariant?: string;
    whiteSpace?: string;
}
```

## measureSvgTextWidth
This function measures the width of the text with the given SVG text properties.

```typescript
function measureSvgTextWidth(textProperties: TextProperties, text?: string): number;
```

### Example

```typescript
import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

let textProperties: TextProperties = {
    text: "Microsoft PowerBI",
    fontFamily: "sans-serif",
    fontSize: "24px"
};

textMeasurementService.measureSvgTextWidth(textProperties);

// returns: 194.71875
```

## measureSvgTextRect
This function returns a rect with the given SVG text properties.

```typescript
function measureSvgTextRect(textProperties: TextProperties, text?: string): SVGRect;
```

### Example

```typescript
import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

let textProperties: TextProperties = {
    text: "Microsoft PowerBI",
    fontFamily: "sans-serif",
    fontSize: "24px"
};

textMeasurementService.measureSvgTextRect(textProperties);

// returns: { x: 0, y: -22, width: 194.71875, height: 27 }
```

## measureSvgTextHeight

This function measures the height of the text with the given SVG text properties.

```typescript
function measureSvgTextHeight(textProperties: TextProperties, text?: string): number;
```

### Example

```typescript
import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

let textProperties: TextProperties = {
    text: "Microsoft PowerBI",
    fontFamily: "sans-serif",
    fontSize: "24px"
};

textMeasurementService.measureSvgTextHeight(textProperties);

// returns: 27
```

## estimateSvgTextBaselineDelta

This function returns a baseline of the given SVG text properties.

```typescript
function estimateSvgTextBaselineDelta(textProperties: TextProperties): number;
```

### Example

```typescript
import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

let textProperties: TextProperties = {
    text: "Microsoft PowerBI",
    fontFamily: "sans-serif",
    fontSize: "24px"
};

textMeasurementService.estimateSvgTextBaselineDelta(textProperties);

// returns: 5
```

## estimateSvgTextHeight

This function estimates the height of the text with the given SVG text properties.

```typescript
function estimateSvgTextHeight(textProperties: TextProperties, tightFightForNumeric?: boolean): number;
```

### Example

```typescript
import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

let textProperties: TextProperties = {
    text: "Microsoft PowerBI",
    fontFamily: "sans-serif",
    fontSize: "24px"
};

textMeasurementService.estimateSvgTextHeight(textProperties);

// returns: 27
```

## measureSvgTextElementWidth

This function measures the width of the svgElement.

```typescript
function measureSvgTextElementWidth(svgElement: SVGTextElement): number;
```

### Example

```typescript
import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

let svg: D3.Selection = d3.select("body").append("svg");

svg.append("text")
    .text("Microsoft PowerBI")
    .attr({
        "x": 25,
        "y": 25
    })
    .style({
        "font-family": "sans-serif",
        "font-size": "24px"
    });

let textElement: D3.Selection = svg.select("text");

textMeasurementService.measureSvgTextElementWidth(textElement.node());

// returns: 194.71875
```

## getMeasurementProperties

This function fetches the text measurement properties of the given DOM element.

```typescript
function getMeasurementProperties(element: JQuery): TextProperties;
```

### Example

```typescript
import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

let element: JQuery = $(document.createElement("div"));

element.text("Microsoft PowerBI");

element.css({
    "width": 500,
    "height": 500,
    "font-family": "sans-serif",
    "font-size": "32em",
    "font-weight": "bold",
    "font-style": "italic",
    "white-space": "nowrap"
});

textMeasurementService.getMeasurementProperties(element);

/* returns: {
    fontFamily:"sans-serif",
    fontSize: "32em",
    fontStyle: "italic",
    fontVariant: "",
    fontWeight: "bold",
    text: "Microsoft PowerBI",
    whiteSpace: "nowrap"
}*/
```

## getSvgMeasurementProperties

This function fetches the text measurement properties of the given SVG text element.

```typescript
function getSvgMeasurementProperties(svgElement: SVGTextElement): TextProperties;
```

### Example

```typescript
import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

let svg: D3.Selection = d3.select("body").append("svg");

let textElement: D3.Selection = svg.append("text")
    .text("Microsoft PowerBI")
    .attr({
        "x": 25,
        "y": 25
    })
    .style({
        "font-family": "sans-serif",
        "font-size": "24px"
    });

textMeasurementService.getSvgMeasurementProperties(textElement.node());

/* returns: {
    "text": "Microsoft PowerBI",
    "fontFamily": "sans-serif",
    "fontSize": "24px",
    "fontWeight": "normal",
    "fontStyle": "normal",
    "fontVariant": "normal",
    "whiteSpace": "nowrap"
}*/
```

## getDivElementWidth

This function returns the width of a div element.

```typescript
function getDivElementWidth(element: JQuery): string;
```

### Example

```typescript
import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

let svg: Element = d3.select("body")
    .append("div")
    .style({
        "width": "150px",
        "height": "150px"
    })
    .node();

textMeasurementService.getDivElementWidth($(svg))

// returns: 150px
```

## getTailoredTextOrDefault

Compares labels text size to the available size and renders ellipses when the available size is smaller.

```typescript
function getTailoredTextOrDefault(textProperties: TextProperties, maxWidth: number): string;
```

### Example

```typescript
import TextProperties = powerbi.extensibility.utils.formatting.TextProperties;
import textMeasurementService = powerbi.extensibility.utils.formatting.textMeasurementService;

let textProperties: TextProperties = {
    text: "Microsoft PowerBI!",
    fontFamily: "sans-serif",
    fontSize: "24px"
};

textMeasurementService.getTailoredTextOrDefault(textProperties);

// returns: Microsof...
```
