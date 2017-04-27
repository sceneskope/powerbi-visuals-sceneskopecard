module powerbi.extensibility.visual {
    import DataViewObjectsParser = powerbi.extensibility.utils.dataview.DataViewObjectsParser;

    export enum FontWeight {
        Normal = <any>"Normal",
        Medium = <any>"Medium",
        Bold = <any>"Bold"
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
        public color = "#ffffff";
        public fontSize = 12;
        public fontWeight = FontWeight.Bold;
        public displayUnits: number = 0;
        public decimalPlaces: number | null = null;
    }

    export class CategoryLabelsSettings {
        public show = true;
        public text = "";
        public color = "#ffffff";
        public fontSize = 8;
        public fontWeight = FontWeight.Normal;
    }

    export class WordWrapSettings {
        public show = false;
    }

    export class BehaviorSettings {
        public innerColor = "#22B573";
        public showBottom = true;
        public showRight = true;
        public outerColor = "#1A9D58";
        public outerWidth = 20;
    }

    export class Settings extends DataViewObjectsParser {
        public values = new ValuesSettings();
        public categoryLabels = new CategoryLabelsSettings();
        public wordWrap = new WordWrapSettings();
        public behavior = new BehaviorSettings();
    }

}
