/** @odoo-module **/

import { registry } from "@web/core/registry";
import { RelationalModel } from "@web/model/relational_model/relational_model";
import {LeafletArchParser} from "./leaflet_parser";
import {LeafletController} from "./leaflet_controller";
import {LeafletRenderer} from "./leaflet_renderer";

export const LeafletView = {
    type: "leaflet",
    display_name: "Leaflet Map",
    icon: "fa fa-map-marker",
    multiRecord: true,
    Controller: LeafletController,
    Renderer: LeafletRenderer,
    ArchParser: LeafletArchParser,
    Model: RelationalModel,

    props: (genericProps, view) => {

        const { ArchParser } = view;
        const { arch, relatedModels, resModel } = genericProps;
        const archInfo = new ArchParser().parse(arch, relatedModels, resModel);

        return {
            ...genericProps,
            Model: view.Model,
            Renderer: view.Renderer,
            archInfo,
        };
    }

};
// Register the table view configuration
registry.category("views").add("leaflet", LeafletView);
