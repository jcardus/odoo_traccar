from odoo import models, fields


class ResUsers(models.Model):
    _inherit = 'res.users'

    traccar_token = fields.Char(string="Tracking platform token", help="Token for accessing tracking platform API")
