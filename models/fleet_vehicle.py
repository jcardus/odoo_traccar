import logging
import re
from datetime import datetime
from odoo import models, fields, api, _
from odoo.http import request
from ..utils.traccar_api import TraccarAPI

logger = logging.getLogger(__name__)


class FleetVehicle(models.Model):
    _inherit = 'fleet.vehicle'

    serial_no = fields.Char(string="GPS Device ID", help="The unique id of the associated gps device")

    def _get_traccar_devices(self):
        key = '_traccar_devices'
        devices = self.env.context.get(key)

        if devices is None:
            traccar = TraccarAPI(self.env)
            response = traccar.get("api/devices")
            if response.status_code == 200:
                devices = {dev['uniqueId']: dev for dev in response.json()}
                self = self.with_context({key: devices})
            else:
                devices = {}
                logger.error(f"Failed to fetch Traccar devices: {response.text}")

        return devices

    def _get_traccar_positions(self):
        key = '_traccar_positions'
        positions = self.env.context.get(key)

        if positions is None:
            traccar = TraccarAPI(self.env)
            response = traccar.get("api/positions")
            if response.status_code == 200:
                positions = {dev['deviceId']: dev for dev in response.json()}
                self = self.with_context({key: positions})
            else:
                positions = {}
                logger.error(f"Failed to fetch Traccar positions: {response.text}")

        return positions

    def _compute_last_update(self):
        for record in self:
            record.last_update = False
        devices = self._get_traccar_devices()
        for record in self:
            device = devices.get(record.serial_no)
            if device and device['lastUpdate']:
                record.last_update = datetime.strptime(
                    re.sub(r'[+\-]\d{2}:\d{2}|Z', '', device['lastUpdate']),
                    "%Y-%m-%dT%H:%M:%S.%f"
                )

    def _compute_longitude(self):
        return self._compute('longitude')

    def _compute_latitude(self):
        return self._compute('latitude')

    def _compute(self, field):
        devices = self._get_traccar_devices()
        positions = self._get_traccar_positions()
        for record in self:
            record[field] = 0
            device = devices.get(record.serial_no)
            if device is not None:
                position = positions.get(device['id'])
                if position is not None:
                    record[field] = position[field]

    @api.model
    def search(self, args, offset=0, limit=None, order=None, count=False):
        if request and not request.session.get('sync_done'):
            results = super(FleetVehicle, self).search([], 0, 1000)
            self._sync_traccar_devices(results)
            request.session['sync_done'] = True
        return super(FleetVehicle, self).search(args, offset, limit, order, count)

    def _find_create_model_brand(self, brand):
        if not brand:
            brand = 'Inconnue'
        manufacturer = self.env['fleet.vehicle.model.brand'].search([('name', '=', brand)], limit=1)
        if not manufacturer:
            manufacturer = self.env['fleet.vehicle.model.brand'].create({'name': brand})
        return manufacturer.id

    def _find_create_model(self, model_string):
        if not model_string:
            brand = 'Inconnue'
        parts = model_string.split(' ', 1)
        brand = parts[0] if parts else ''
        model = parts[1] if len(parts) > 1 else parts[0]
        brand_id = self._find_create_model_brand(brand)
        _model = self.env['fleet.vehicle.model'].search([
            ('name', '=', model),
            ('brand_id', '=', brand_id)], limit=1)
        if not _model:
            _model = self.env['fleet.vehicle.model'].create({
                'name': model,
                'brand_id': brand_id,
            })
        return _model.id

    def _sync_traccar_devices(self, results):
        devices = self._get_traccar_devices()
        if not devices:
            return

        existing_serial_numbers = set(results.mapped('serial_no'))
        new_devices = [
            {
                'license_plate': device.get('name'),
                'serial_no': device.get('uniqueId'),
                'model_id': self._find_create_model(device.get('model'))
            }
            for key, device in devices.items()
            if device.get('uniqueId') not in existing_serial_numbers
        ]
        if new_devices:
            logger.info("Adding %d new devices to Odoo", len(new_devices))
            super(FleetVehicle, self).create(new_devices)
