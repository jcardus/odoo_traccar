import os

import requests

from odoo import _
from odoo.exceptions import UserError


class TraccarAPI:

    def __init__(self, env):
        self.env = env

    @staticmethod
    def _get_traccar_url():
        return os.environ.get('TRACCAR_URL') or "http://gps.frotaweb.com"

    def _get_headers(self):
        user = self.env.user
        if not user.traccar_token:
            raise UserError(_("The current user is not authorized to sync with gps platform."))
        return {
            "Authorization": f"Bearer {user.traccar_token}",
            "Content-Type": "application/json",
        }

    def get(self, path):
        return requests.get(f"{self._get_traccar_url()}/{path}", headers=self._get_headers())

    def post(self, path, json):
        return requests.post(f"{self._get_traccar_url()}/{path}", json=json, headers=self._get_headers())

    def delete(self, path):
        return requests.delete(f"{self._get_traccar_url()}/{path}", headers=self._get_headers())
