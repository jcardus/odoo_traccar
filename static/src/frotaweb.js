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

export function displayNotificationAction(env, action) {
    const params = action.params || {};
    const options = {
        className: params.className || "",
        sticky: params.sticky || false,
        title: params.title,
        type: params.type || "info",
    };
    const links = (params.links || []).map((link) => {
        return `<a href="${escape(link.url)}" target="_blank">${escape(link.label)}</a>`;
    });
    const message = markup(sprintf(escape(params.message), ...links));
    env.services.notification.add(message, options);
    return params.next;
}

registry.category("actions").add("odoo_traccar.dashboard", OdooTraccar);
registry.category("actions").add("odoo_traccar.reports", OdooTraccarReports);
registry.category("actions").add("odoo_traccar.platform", displayNotificationAction);
