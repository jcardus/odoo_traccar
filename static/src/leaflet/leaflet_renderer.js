/** @odoo-module **/
import {
    Component,
    onMounted,
    useRef,
    onWillStart
} from "@odoo/owl";

import { Field } from "@web/views/fields/field";
import { ViewScaleSelector } from "@web/views/view_components/view_scale_selector";
import { useService } from "@web/core/utils/hooks";
import { Pager } from "@web/core/pager/pager";
import { Widget } from "@web/views/widgets/widget";
import { loadJS, loadCSS } from "@web/core/assets"

const mapboxAccessToken='pk.eyJ1IjoiZW50cmFjayIsImEiOiJjbTY3OGl0c20wMXB4MmpyNGk1ZzUweW53In0.aEqzNwlbMnufoMxcyh2jig'

export class LeafletRenderer extends Component {
    setup() {
        this.uiService = useService("ui");
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
            await loadCSS("https://api.mapbox.com/mapbox-gl-js/v3.9.3/mapbox-gl.css")
            await loadJS("https://api.mapbox.com/mapbox-gl-js/v3.9.3/mapbox-gl.js")
        })

        onMounted(()=>{
            mapboxgl.accessToken = mapboxAccessToken
            const map = new mapboxgl.Map({
                container: 'map', // container ID
                center: [-7.5, 37.5], // starting position [lng, lat]. Note that lat must be set between -90 and 90
                zoom: 9 // starting zoom
            });
            map.addControl(new mapboxgl.NavigationControl());
            map.on('style.load', () => {
                map.setFog({}); // Set the default atmosphere style
            });

            this.records.forEach(record => {
                this.createMarker(record);
            })

            /*this.map.on('popupopen', ()=>{
                this.openContact()
            })*/
        })

    }

    createMarker(record){
        return
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
