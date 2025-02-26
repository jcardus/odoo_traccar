/** @odoo-module **/

import { Component, onWillStart, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { rpc } from "@web/core/network/rpc";


function getHost() {
    return window.location.hostname.split('.').length === 3 ?
        window.location.hostname.replace(/^[^.]+/, "dash") :
        'dash.' + window.location.hostname;
}

class OdooTraccar extends Component {
    static template = "frotaweb.dashboard";

    setup() {
        this.state = useState({iframeSrc: ""});
        onWillStart(async () => {
            const token = await rpc('/odoo_traccar/token')
            this.state.iframeSrc = `https://${getHost()}/traccar?token=${token}`;
        });
    }
}


class OdooTraccarReports extends Component {
    static template = "frotaweb.dashboard";

    setup() {
        this.state = useState({iframeSrc: ""});
        onWillStart(async () => {
            const token = await rpc('/odoo_traccar/token')
            this.state.iframeSrc = `https://${getHost()}/traccar/reports/combined?token=${token}`;
        });
    }
}

export function displayNotificationAction2(env, action) {
    const params = action.params || {};
    window.open(`https://${getHost()}`)
    return params.next;
}

registry.category("actions").add("odoo_traccar.dashboard", OdooTraccar);
registry.category("actions").add("odoo_traccar.reports", OdooTraccarReports);
registry.category("actions").add("odoo_traccar.platform", displayNotificationAction2);
