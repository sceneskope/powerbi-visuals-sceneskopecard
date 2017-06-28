module powerbi.extensibility.visual {
    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;

    export enum FontWeight {
        Normal = <any>"Normal",
        Medium = <any>"Medium",
        Bold = <any>"Bold"
    }

    export enum CategoryPosition {
        Top = <any>"Top",
        Bottom = <any>"Bottom"
    }

    export function fontWeightConverter(weight: FontWeight) {
        switch (weight) {
            case FontWeight.Normal: return 400;
            case FontWeight.Medium: return 500;
            case FontWeight.Bold: return 700;
            default: return 400;
        }
    }

    export class ValuesSettings {
        public color = "#333333";
        public fontSize = 20;
        public fontWeight = FontWeight.Bold;
        public displayUnits: number = 0;
        public decimalPlaces: number | null = null;
    }

    export class CategoryLabelsSettings {
        public show = true;
        public text = "";
        public color = "#a6a6a6";
        public fontSize = 12;
        public fontWeight = FontWeight.Normal;
        public position = CategoryPosition.Top;
    }

    export class WordWrapSettings {
        public show = false;
    }

    export class BehaviorSettings {
        public innerColor = "";
        public showLeft = false;
        public showTop = true;
        public showBottom = false;
        public showRight = false;
        public outerColor = "";
    }

    export class Settings extends DataViewObjectsParser {
        public values = new ValuesSettings();
        public categoryLabels = new CategoryLabelsSettings();
        public wordWrap = new WordWrapSettings();
        public behavior = new BehaviorSettings();
    }

}
