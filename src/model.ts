module powerbi.extensibility.visual {
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    export interface ViewModel {
        values: PrimitiveValue[];
        label: string | undefined;
        settings: Settings;
        formatters: IValueFormatter[];
    }

    export function visualTransform(options: VisualUpdateOptions, host: IVisualHost): ViewModel {
        const dataViews = options.dataViews;
        if (!options.dataViews
            || !options.dataViews[0]
            || !options.dataViews[0].table
            || !options.dataViews[0].table!.rows
            || !options.dataViews[0].table!.rows![0]) {
            return {
                values: [],
                label: undefined,
                settings: Settings.getDefault() as Settings,
                formatters: []
            };
        }

        const dataView = options.dataViews[0];
        const table = dataView.table!;
        const columns = table.columns;
        const settings = Settings.parse<Settings>(dataView);

        let label: string | undefined;
        if (settings.categoryLabels.show) {
            if (settings.categoryLabels.text) {
                label = settings.categoryLabels.text;
            } else {
                label =
                    columns
                    && columns[0]
                    && columns[0].displayName
                    || undefined;
            }
        } else {
            label = undefined;
        }

        const values = table.rows![0] as PrimitiveValue[];
        const formatters = columns.map(c =>
            valueFormatter.create({
                format: valueFormatter.getFormatStringByColumn(c)
            }));

        return {
            settings: settings,
            label: label,
            values: values,
            formatters: formatters
        };

    }
}