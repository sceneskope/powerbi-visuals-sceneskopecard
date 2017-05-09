module powerbi.extensibility.visual {
    import valueFormatter = powerbi.extensibility.utils.formatting.valueFormatter;
    import IValueFormatter = powerbi.extensibility.utils.formatting.IValueFormatter;
    export interface ViewModel {
        value: PrimitiveValue;
        label: string | undefined;
        settings: Settings;
        formatter: IValueFormatter;
    }

    export function visualTransform(options: VisualUpdateOptions, host: IVisualHost): ViewModel {
        const dataViews = options.dataViews;
        if (!options.dataViews
            || !options.dataViews[0]
            || !options.dataViews[0].single
            || !options.dataViews[0].single.value) {
            return {
                value: "",
                label: undefined,
                settings: Settings.getDefault() as Settings,
                formatter: valueFormatter.create({})
            };
        }

        const dataView = options.dataViews[0];
        const settings = Settings.parse<Settings>(dataView);

        const objects = dataView.metadata.objects;
        const value = dataView.single.value;

        let label: string | undefined;
        if (settings.categoryLabels.show) {
            if (settings.categoryLabels.text) {
                label = settings.categoryLabels.text;
            } else {
                label =
                    dataView.metadata
                    && dataView.metadata.columns
                    && dataView.metadata.columns[0]
                    && dataView.metadata.columns[0].displayName
                    || undefined;
            }
        } else {
            label = undefined;
        }

        const column = dataView.metadata.columns[0];
        const formatter = valueFormatter.create({
            format: valueFormatter.getFormatStringByColumn(column)
        });

        return {
            settings: settings,
            label: label,
            value: value,
            formatter: formatter
        };

    }
}