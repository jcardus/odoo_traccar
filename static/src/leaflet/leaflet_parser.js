/** @odoo-module */

import { Field } from "@web/views/fields/field";
import { visitXML } from "@web/core/utils/xml";
import { Widget } from "@web/views/widgets/widget";

export class LeafletArchParser {

    parse(arch, models, modelName){

        // attributes of the arch for the leaflet map
        const latitude = arch.getAttribute("latitude")
        const longitude = arch.getAttribute("longitude")

        // attributes of the arch for the leaflet map for the center point of the map
        const center = arch.getAttribute("center")

        // attributes of the arch for the leaflet map for the zoom of the map
        const zoom = arch.getAttribute("zoom")

        // attributes of the arch for the leaflet map for the panel name of the list of fields to display
        const title = arch.getAttribute("title")

        const limit = arch.getAttribute("limit");

        const fieldsToDisplay = []

        const fieldNodes = {};
        const widgetNodes = {};
        let widgetNextId = 0;
        const fieldNextIds = {};
        let autofocusFieldId = null;

        visitXML(arch, (node) => {
            if (node.tagName === "field"){
                fieldsToDisplay.push(node.getAttribute("name"))
            }
            if (node.tagName === "field") {
                const fieldInfo = Field.parseFieldNode(node, models, modelName, "form");
                if (!(fieldInfo.name in fieldNextIds)) {
                    fieldNextIds[fieldInfo.name] = 0;
                }
                const fieldId = `${fieldInfo.name}`;
                fieldNodes[fieldId] = fieldInfo;
                node.setAttribute("field_id", fieldId);
                if (fieldInfo.type === "properties") {
                    activeActions.addPropertyFieldValue = true;
                }
                return false;
            } else if (node.tagName === "widget") {
                const widgetInfo = Widget.parseWidgetNode(node);
                const widgetId = `widget_${++widgetNextId}`;
                widgetNodes[widgetId] = widgetInfo;
                node.setAttribute("widget_id", widgetId);
            }
        })

        return {
            latitude,
            longitude,
            center,
            zoom,
            title,
            limit,
            fieldsToDisplay,
            fieldNodes,
            widgetNodes,
        }
    }

}
