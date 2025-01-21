from odoo import fields, models


class WinActView(models.Model):
    """
    Extends the base 'ir.actions.act_window.view' model to include
    a new view mode called 'grid'.
    """

    _inherit = "ir.actions.act_window.view"

    view_mode = fields.Selection(
        selection_add=[("leaflet", "Leaflet Map")], ondelete={"leaflet":"cascade"}
    )
