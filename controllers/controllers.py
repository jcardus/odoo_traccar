# -*- coding: utf-8 -*-

import logging
from urllib.parse import quote

from werkzeug.utils import redirect

from odoo import http
from odoo.http import request

logger = logging.getLogger(__name__)


class Odootraccar(http.Controller):
    @http.route('/odoo_traccar/token', type='json', auth='user')
    def get_url(self):
        return request.env.user.traccar_token



