# -*- coding: utf-8 -*-

import logging
from urllib.parse import quote

from werkzeug.utils import redirect

from odoo import http
from odoo.http import request

logger = logging.getLogger(__name__)


class CustomAuthLogout(http.Controller):
    # Default Odoo login logic
    @http.route('/web/session/logout', type='http', auth="user", website=True)
    def logout(self, **kwargs):
        request.session.logout()
        base_url = request.httprequest.host_url
        post_logout_redirect_uri = f"{base_url}web/login"
        encoded_redirect_uri = quote(post_logout_redirect_uri, safe='')
        auth0_logout_url = f"https://auth.pinme.io/oidc/logout?post_logout_redirect_uri={encoded_redirect_uri}"

        return redirect(auth0_logout_url, 303)


class Odootraccar(http.Controller):
    @http.route('/odoo_traccar/token', type='json', auth='user')
    def get_url(self):
        return request.env.user.traccar_token



