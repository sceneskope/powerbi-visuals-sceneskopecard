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
        private readonly svg: SVGSVGElement;
        private readonly valueGElement: SVGGElement;
        private valueTextElements: SVGTextElement[] = [];
        private readonly labelGElement: SVGGElement;
        private readonly labelTextElement: SVGTextElement;
        private coreBackground?: SVGRectElement;
        private mainBackground?: SVGRectElement;

        constructor(options: VisualConstructorOptions) {
            this.host = options.host;
            const document = options.element.ownerDocument;
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.svg = svg;
            this.valueGElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.labelGElement = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.labelTextElement = document.createElementNS("http://www.w3.org/2000/svg", "text");
            options.element.appendChild(svg);
            svg.appendChild(this.valueGElement);
            svg.appendChild(this.labelGElement).appendChild(this.labelTextElement);
        }

        private createSvgRect() : SVGRectElement { return this.createSvgElement("rect") as SVGRectElement; }
        private createSvgElement(name: string) {
            const element = this.svg.ownerDocument.createElementNS("http://www.w3.org/2000/svg", name);
            return this.svg.appendChild(element);
        }

        public update(options: VisualUpdateOptions) {
            try {
                const viewModel = this.viewModel = visualTransform(options, this.host);
                const settings = viewModel.settings;

                const width = options.viewport.width;
                const height = options.viewport.height;

                this.svg.setAttribute("width", `${width}px`);
                this.svg.setAttribute("height", `${height}px`);

                // if (settings.behavior.outerColor) {
                //     const rect = this.mainBackground || (this.mainBackground = this.createSvgRect());
                //     rect.setAttribute("width", `${width}px`);
                //     rect.setAttribute("height", `${height}px`);
                //     rect.setAttribute("fill", settings.behavior.outerColor);
                // } else {
                //     if (this.mainBackground) {
                //         this.svg.removeChild(this.mainBackground);
                //         this.mainBackground = undefined;
                //     }
                // }

                const labelFontSizePixels = PixelConverter.fromPointToPixel(settings.categoryLabels.fontSize);
                const outerWidth = 2 * labelFontSizePixels;
                const topHeight = settings.behavior.showTop ? outerWidth : 0;
                // const bottomHeight = settings.behavior.showBottom ? outerWidth : 0;
                const leftWidth = settings.behavior.showLeft ? outerWidth : 0;
                // const rightWidth = settings.behavior.showRight ? outerWidth : 0;
                // const coreHeight = height - (topHeight + bottomHeight);
                // const coreWidth = width - (leftWidth + rightWidth);

                // if (settings.behavior.innerColor) {
                //     const rect = this.coreBackground || (this.coreBackground = this.createSvgRect());
                //     rect.setAttribute("width", `${coreWidth}px`);
                //     rect.setAttribute("height", `${coreHeight}px`);
                //     rect.setAttribute("fill", settings.behavior.innerColor);
                // } else {
                //     if (this.coreBackground) {
                //         this.svg.removeChild(this.coreBackground);
                //         this.coreBackground = undefined;
                //     }
                // }

                const valueData = viewModel.values;
                const corePadding = 10;

                const translateX = leftWidth + corePadding;
                const valueFontSizePixels = PixelConverter.fromPointToPixel(settings.values.fontSize);
                const valueTranslateY = topHeight + corePadding + valueFontSizePixels;

                this.valueGElement.setAttribute("transform", svgutils.translate(translateX, valueTranslateY));

                const valueTextElements = this.valueTextElements;
                if (valueTextElements.length !== valueData.length) {
                    const document = this.svg.ownerDocument;
                    while (valueData.length > valueTextElements.length) {
                        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                        this.valueGElement.appendChild(text);
                        valueTextElements.push(text);
                    }
                    while (valueData.length < valueTextElements.length) {
                        const text = valueTextElements.pop()!;
                        this.valueGElement.removeChild(text);
                    }
                }
                for (let i = 0; i < valueData.length; i++) {
                    const text = this.valueTextElements[i];
                    text.textContent = viewModel.formatters[i].format(valueData[i]);
                    text.setAttribute("transform",svgutils.translate(0, i * (corePadding + valueFontSizePixels)));
                    text.setAttribute("font-size", `${valueFontSizePixels}px`);
                    text.setAttribute("font-weight", `${fontWeightConverter(settings.values.fontWeight)}`);
                    text.setAttribute("fill", settings.values.color);
                    text.setAttribute("text-anchor", "left");
                }

                const labelData = viewModel.label;
                const labelTranslateY = settings.categoryLabels.position === CategoryPosition.Top
                    ? topHeight - (labelFontSizePixels / 2)
                    : height - (labelFontSizePixels / 2);

                this.labelGElement.setAttribute("transform", svgutils.translate(translateX, labelTranslateY));
                if (labelData) {
                    const text = this.labelTextElement;
                    text.textContent = labelData;
                    text.setAttribute("font-size", `${labelFontSizePixels}px`);
                    text.setAttribute("font-weight", `${fontWeightConverter(settings.values.fontWeight)}`);
                    text.setAttribute("fill", settings.categoryLabels.color);
                    text.setAttribute("text-anchor", "left");
                }
                else {
                    this.labelTextElement.textContent = "";
                }
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