/** @odoo-module **/
import {
    Component,
    onMounted,
    useRef,
    onWillStart
} from "@odoo/owl";

import { _t } from "@web/core/l10n/translation";
import { Field } from "@web/views/fields/field";
import { ViewScaleSelector } from "@web/views/view_components/view_scale_selector";
import { useService } from "@web/core/utils/hooks";
import { Pager } from "@web/core/pager/pager";
import { Widget } from "@web/views/widgets/widget";
import { loadJS, loadCSS } from "@web/core/assets"

export class LeafletRenderer extends Component {
    setup() {
        this.uiService = useService("ui");
        this.leafletRef = useRef("leaflet");

        this.root = useRef('map')
        this.action = useService('action')
        const { latitude, longitude, center, zoom, title, fieldsToDisplay, fieldNodes, widgetNodes} = this.props.archInfo
        this.latitude = latitude;
        this.longitude = longitude;
        this.center = center;
        this.center_lat = center? center.split(",")[0]: 29.942756347393566;
        this.center_long = center?center.split(",")[1]: -95.39379227947576;
        this.zoom = zoom? zoom:10;
        this.title = title?title:"Contacts";
        this.fieldsToDisplay = fieldsToDisplay;
        this.fieldNodes =  fieldNodes;
        this.widgetNodes = widgetNodes;
        this.records =  this.props.data.records;

        onWillStart(async ()=>{
            await loadCSS("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css")
            await loadJS("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js")
        })

        onMounted(()=>{
            this.map = L.map(this.root.el).setView([this.center_lat, this.center_long], this.zoom);

            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(this.map);

            this.records.forEach(record => {
                this.createMarker(record);
            })

            this.map.on('popupopen', ()=>{
                this.openContact()
            })
        })

    }

    createMarker(record){

        if (record.data[this.latitude] != 0 && record.data[this.longitude] != 0) {

            const marker = L.marker([record.data[this.latitude], record.data[this.longitude]]).addTo(this.map);

            let html = ""

            if (this.fieldsToDisplay.length > 0){
                this.fieldsToDisplay.forEach(field=>{
                    html += `<p><b>${this.fieldNodes[field].string}:</b> ${record.data[field]}</p>`
                })
            } else {
                html += `<p>${record.data["name"]}</p>`
            }

            html += `<button id="leafletMapPopupOpenBtn" data-res-id='${record.id}' class='btn btn-primary'>Open</button>`

            marker.bindPopup(html).openPopup();

        }
    }

    openContact(){
        const buttons = document.querySelectorAll("#leafletMapPopupOpenBtn")
        buttons.forEach(button => {
            button.addEventListener('click', ()=>{
                console.log("Open button works!")
                // action.doAction or action.switchView | resId
                this.action.switchView("form", { resId: parseInt(button.dataset.resId) })
            })
        })
    }

    setMapView(record) {
        console.log(record.data['name']);
        if (record.data[this.latitude] && record.data[this.longitude]) {
            this.map.setView([record.data[this.latitude], record.data[this.longitude]], 14)
        }
    }

    getRecords() {
        if (this.map) {

            this.props.data.records.forEach(record => {
                this.createMarker(record);
            })

        }

        return this.props.data.records;
    }

    sidebarExpand() {
        document.querySelector("#sidebar").classList.toggle("expand");
    }

}
LeafletRenderer.template = "odoo_traccar.LeafletRenderer";

LeafletRenderer.components = { Field, Pager, Widget, ViewScaleSelector };

LeafletRenderer.props = [
    "data",
    "archInfo"
];
