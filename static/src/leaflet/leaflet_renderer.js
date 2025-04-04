/** @odoo-module **/
import {
    Component,
    onMounted,
    useRef,
    onWillStart,
    onWillUpdateProps,
    useState,
} from "@odoo/owl";

import { Field } from "@web/views/fields/field";
import { ViewScaleSelector } from "@web/views/view_components/view_scale_selector";
import { useService } from "@web/core/utils/hooks";
import { Pager } from "@web/core/pager/pager";
import { Widget } from "@web/views/widgets/widget";
import { loadJS, loadCSS } from "@web/core/assets"

const markers = []
const mapboxAccessToken='pk.eyJ1IjoiZW50cmFjayIsImEiOiJjbTY3OGl0c20wMXB4MmpyNGk1ZzUweW53In0.aEqzNwlbMnufoMxcyh2jig'
let map, marker
export class LeafletRenderer extends Component {
    setup() {
        this.popup = useRef('popup')
        this.action = useService('action')
        const {center, zoom} = this.props.archInfo
        this.center = center;
        this.zoom = zoom ? zoom : 14;
        this.records = this.props.data.records;
        this.state = useState({name: ''})

        onWillStart(async () => {
            await loadCSS("https://api.mapbox.com/mapbox-gl-js/v3.9.3/mapbox-gl.css")
            await loadJS("https://api.mapbox.com/mapbox-gl-js/v3.9.3/mapbox-gl.js")
        })

        onWillUpdateProps(this.willUpdateProps)

        onMounted(() => {
            mapboxgl.accessToken = mapboxAccessToken
            map = new mapboxgl.Map({
                container: 'map',
                center: (this.records[0] && [this.records[0].data.longitude, this.records[0].data.latitude]) || this.center,
                zoom: this.zoom
            });
            map.addControl(new mapboxgl.NavigationControl());
            this.willUpdateProps(this.props)
            new MutationObserver(() => {
                if (marker && marker.getPopup().isOpen()) {
                    marker.getPopup().setHTML(this.popup.el.innerHTML)
                }
            }).observe(this.popup.el, {subtree: true, characterData: true})
        })
    }

    willUpdateProps({data}) {
        const bounds = new mapboxgl.LngLatBounds();
        markers.forEach(m => m.remove())
        markers.length = 0
        data.records.forEach(
            record => {
                if (record.data.latitude && record.data.longitude) {
                    const lngLat = [record.data.longitude, record.data.latitude]
                    markers.push(
                        new mapboxgl.Marker({color: '#A5371B'})
                            .setLngLat(lngLat)
                            .setPopup(new mapboxgl.Popup({offset: 40}))
                            .addTo(map)
                    )
                    bounds.extend(lngLat);
                }
            }
        )
        if (!bounds.isEmpty()) {
            map.fitBounds(bounds, { padding: 50, maxZoom: 15 });
        }
    }

    openContact() {
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
        if (record.data.latitude && record.data.longitude) {
            if (marker && marker.getPopup().isOpen()) { marker.togglePopup() }
            this.state.name = record.data.name
            const lngLat = [record.data.longitude, record.data.latitude]
            map.easeTo({ center: lngLat, zoom: 13 })
            marker = markers.find(m => m.getLngLat().lng === lngLat[0] && m.getLngLat().lat === lngLat[1])
            if (marker && !marker.getPopup().isOpen()) { marker.togglePopup() }
        }
    }

    getRecords() {
        return this.props.data.records;
    }
}
LeafletRenderer.template = "odoo_traccar.LeafletRenderer";

LeafletRenderer.components = { Field, Pager, Widget, ViewScaleSelector };

LeafletRenderer.props = [
    "data",
    "archInfo"
];
