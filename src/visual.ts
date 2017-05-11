/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import DisplayUnit = powerbi.extensibility.utils.formatting.DisplayUnit;
    import PixelConverter = powerbi.extensibility.utils.type.PixelConverter;
    import tooltip = powerbi.extensibility.utils.tooltip;
    import svgutils = powerbi.extensibility.utils.svg;


    export class Visual implements IVisual {
        private viewModel?: ViewModel;
        private readonly host: IVisualHost;
        private readonly svg: d3.Selection<SVGElement>;
        private readonly valueElement: d3.Selection<SVGElement>;
        private readonly labelElement: d3.Selection<SVGElement>;
        private readonly coreBackground: d3.Selection<SVGElement>;
        private readonly mainBackground: d3.Selection<SVGElement>;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            const svg = this.svg = d3.select(options.element).append("svg")
                .classed("sceneSkopeCard", true);
            const g = svg.append("g");
            this.mainBackground = g.append("g").append("rect");
            this.coreBackground = g.append("g").append("rect");
            this.valueElement = g.append("g");
            this.labelElement = g.append("g");
        }

        public update(options: VisualUpdateOptions) {
            try {
                const viewModel = this.viewModel = visualTransform(options, this.host);
                const settings = viewModel.settings;

                const width = options.viewport.width;
                const height = options.viewport.height;

                this.svg
                    .attr("width", width)
                    .attr("height", height);

                this.mainBackground
                    .attr("width", width)
                    .attr("height", height)
                    .attr("fill", settings.behavior.outerColor);

                const labelFontSizePixels = PixelConverter.fromPointToPixel(settings.categoryLabels.fontSize);
                const outerWidth =  3 * labelFontSizePixels;
                const topHeight = settings.behavior.showTop ? outerWidth : 0;
                const bottomHeight = settings.behavior.showBottom ? outerWidth : 0;
                const leftWidth = settings.behavior.showLeft ? outerWidth : 0;
                const rightWidth = settings.behavior.showRight ? outerWidth : 0;
                const coreHeight = height - (topHeight + bottomHeight);
                const coreWidth = width - (leftWidth + rightWidth);

                this.coreBackground
                    .attr("width", coreWidth)
                    .attr("height", coreHeight)
                    .attr("transform", svgutils.translate(leftWidth, topHeight))
                    .attr("fill", settings.behavior.innerColor);

                const valueData = viewModel.values;
                const corePadding = 10;

                const translateX = leftWidth + corePadding;
                const valueFontSizePixels = PixelConverter.fromPointToPixel(settings.values.fontSize);
                const valueTranslateY = topHeight + corePadding + valueFontSizePixels;

                const valueText =
                    this.valueElement
                        .attr("transform", svgutils.translate(translateX, valueTranslateY))
                        .selectAll("text")
                        .data(valueData);

                valueText
                    .enter()
                    .append("text");


                valueText
                    .text((value, i) => viewModel.formatters[i].format(value))
                    .attr("transform", (value, i) => svgutils.translate(0, i * (corePadding + valueFontSizePixels)))
                    .style({
                        "font-size": valueFontSizePixels,
                        "font-weight": fontWeightConverter(settings.values.fontWeight),
                        "fill": settings.values.color,
                        "text-anchor": "left"
                    });

                valueText
                    .exit()
                    .remove();

                const labelData = viewModel.label ? [viewModel.label] : [];
                const labelTranslateY = settings.categoryLabels.position === CategoryPosition.Top
                    ? topHeight - labelFontSizePixels
                    : height - labelFontSizePixels;

                const labelText =
                    this.labelElement
                        .attr("transform", svgutils.translate(translateX, labelTranslateY))
                        .selectAll("text")
                        .data(labelData);

                labelText
                    .enter()
                    .append("text");

                labelText
                    .text(d => d)
                    .style({
                        "font-size": labelFontSizePixels,
                        "font-weight": fontWeightConverter(settings.categoryLabels.fontWeight),
                        "fill": settings.categoryLabels.color,
                        "text-anchor": "left"
                    });

                labelText
                    .exit()
                    .remove();


            }
            catch (ex) {
                console.warn(ex);
                throw ex;
            }
        }

        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstanceEnumeration {
            try {
                const settings = this.viewModel ? this.viewModel.settings : Settings.getDefault() as Settings;
                const instanceEnumeration = Settings.enumerateObjectInstances(settings, options);
                return instanceEnumeration || [];
            }
            catch (ex) {
                console.warn(ex);
                throw ex;
            }
        }

    }
}