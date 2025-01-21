from odoo import fields, models

class View(models.Model):
    _inherit = "ir.ui.view"
    type = fields.Selection(selection_add=[("leaflet", "Leaflet Map")])

    def _get_view_info(self):
        return {'leaflet': {'icon': 'fa fa-share-alt o_hierarchy_icon'}} | super()._get_view_info()



