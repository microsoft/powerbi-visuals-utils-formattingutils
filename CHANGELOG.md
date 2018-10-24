## 3.1.0
* Update packages to fix vulnerabilities

## 3.0.2
* Fix: measureSvgTextRect used to return incorrect SVGRect for the second and further calls because it did not clear temp DOM element

## 3.0.1
* FIX: In IFormattingService interface was changed formatNumberWithCustomOverride function declaration to accept culture name as last optional parameter
* FIX: formatHelper function In DisplayUnit class for now passes culture name to formattingService.formatNumberWithCustomOverride call

## 3.0.0
* Removed `d3` and `powerbi-visuals-utils-svgutils`
* Updated dependencies

## 2.1.0
* Removed `lodash`
* Updated dependencies
