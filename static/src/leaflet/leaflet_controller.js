/** @odoo-module **/

import {
    Component,
    useState,
    useRef
} from "@odoo/owl";

import { Layout } from "@web/search/layout";
import { useService, useBus } from "@web/core/utils/hooks";
import { standardViewProps } from "@web/views/standard_view_props";
import { SearchBar } from "@web/search/search_bar/search_bar";
import { CogMenu } from "@web/search/cog_menu/cog_menu";
import { session } from "@web/session";
import { useModelWithSampleData } from "@web/model/model";
import { extractFieldsFromArchInfo } from "@web/model/relational_model/utils";
import { usePager } from "@web/search/pager_hook";
import { useSearchBarToggler } from "@web/search/search_bar/search_bar_toggler";

export class LeafletController extends Component {
    async setup() {
        this.actionService = useService("action");
        this.dialogService = useService("dialog");
        this.userService = useService("user");
        this.rpc = useService("rpc");
        this.rootRef = useRef("root");

        this.archInfo = this.props.archInfo;

        this.model = useState(useModelWithSampleData(this.props.Model, this.modelParams));

        this.model.initialLimit = parseInt(this.props.archInfo.limit);

        usePager(() => {
            const { count, hasLimitedCount, isGrouped, limit, offset } = this.model.root;

            return {
                offset: offset,
                limit: limit,
                total: count,
                onUpdate: async ({ offset, limit }, hasNavigated) => {
                    if (this.model.root.editedRecord) {
                        if (!(await this.model.root.editedRecord.save())) {
                            return;
                        }
                    }
                    await this.model.root.load({ limit, offset });
                    if (hasNavigated) {
                        this.onPageChangeScroll();
                    }
                },
                updateTotal:
                    !isGrouped && hasLimitedCount ? () => this.model.root.fetchCount() : undefined,
            };
        });

        this.searchBarToggler = useSearchBarToggler();

    }

    get modelParams() {
        const { defaultGroupBy, rawExpand } = this.archInfo;
        const { activeFields, fields } = extractFieldsFromArchInfo(
            this.archInfo,
            this.props.fields
        );
        const groupByInfo = {};

        const modelConfig = this.props.state?.modelState?.config || {
            resModel: this.props.resModel,
            fields,
            activeFields,
            openGroupsByDefault: rawExpand ? evaluateExpr(rawExpand, this.props.context) : false,
        };

        return {
            config: modelConfig,
            state: this.props.state?.modelState,
            groupByInfo,
            limit: this.archInfo.limit || this.props.limit,
            countLimit: this.archInfo.countLimit,
            defaultOrderBy: this.archInfo.defaultOrder,
            defaultGroupBy: this.props.searchMenuTypes.includes("groupBy") ? defaultGroupBy : false,
            groupsLimit: this.archInfo.groupsLimit,
            multiEdit: this.archInfo.multiEdit,
            activeIdsLimit: session.active_ids_limit
        };
    }

    onPageChangeScroll() {
        if (this.rootRef && this.rootRef.el) {
            this.rootRef.el.querySelector(".o_content").scrollTop = 0;
        }
    }

}

LeafletController.template = "odoo_traccar.LeafletView";

LeafletController.components = {
    Layout,
    SearchBar,
    CogMenu
};

LeafletController.props = {
    ...standardViewProps,
    Model: Function,
    Renderer: Function,
    archInfo: Object
};

LeafletController.defaultProps = {
    createRecord: () => {},
    selectRecord: () => {},
};
