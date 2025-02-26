/** @odoo-module **/

import { Component, onWillStart, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { rpc } from "@web/core/network/rpc";


class OdooTraccar extends Component {
    static template = "frotaweb.dashboard";

    setup() {
        this.state = useState({iframeSrc: ""});
        onWillStart(async () => {
            const token = await rpc('/odoo_traccar/token')
            this.state.iframeSrc = `https://${window.location.hostname.replace(/^[^.]+/, "dash")}/traccar?token=${token}`;
        });
    }
}


class OdooTraccarReports extends Component {
    static template = "frotaweb.dashboard";

    setup() {
        this.state = useState({iframeSrc: ""});
        onWillStart(async () => {
            const token = await rpc('/odoo_traccar/token')
            this.state.iframeSrc = `https://${window.location.hostname.replace(/^[^.]+/, "dash")}/traccar/reports/combined?token=${token}`;
        });
    }
}

registry.category("actions").add("odoo_traccar.dashboard", OdooTraccar);
registry.category("actions").add("odoo_traccar.reports", OdooTraccarReports);
