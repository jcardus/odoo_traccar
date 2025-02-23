/** @odoo-module **/

import  { Component, onMounted, useState } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";


class OdooTraccar extends Component {
    static template = "frotaweb.dashboard";
    setup() {
        this.state = useState({iframeSrc: ""});
        this.rpc = useService('rpc')
        onMounted(async () => {
            const token = await this.rpc('/odoo_traccar/token')
            this.state.iframeSrc = `https://${window.location.hostname.replace(/^[^.]+/, "traccar")}?token=${token}`;
        });
    }
}


class OdooTraccarReports extends Component {
    static template = "frotaweb.dashboard";
    setup() {
        this.state = useState({iframeSrc: ""});
        this.rpc = useService('rpc')
        onMounted(async () => {
            const token = await this.rpc('/odoo_traccar/token')
            this.state.iframeSrc = `https://${window.location.hostname.replace(/^[^.]+/, "traccar")}/reports/combined?token=${token}`;
        });
    }
}

export function displayNotificationAction2(env, action) {
    const params = action.params || {};
    window.open(`https://${window.location.hostname.replace(/^[^.]+\./, "")}`)
    return params.next;
}

registry.category("actions").add("odoo_traccar.dashboard", OdooTraccar);
registry.category("actions").add("odoo_traccar.reports", OdooTraccarReports);
registry.category("actions").add("odoo_traccar.platform", displayNotificationAction2);
