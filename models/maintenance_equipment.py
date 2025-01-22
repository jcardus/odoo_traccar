import logging
import re
from datetime import datetime
from odoo import models, fields, api, _
from odoo.exceptions import UserError
from ..utils.traccar_api import TraccarAPI

logger = logging.getLogger(__name__)

class MaintenanceEquipment(models.Model):
    _inherit = 'maintenance.equipment'

    latitude = fields.Float(
        compute="_compute_latitude",
        store=False,
    )
    longitude = fields.Float(
        compute="_compute_longitude",
        store=False,
    )
    serial_no = fields.Char(
        required=True
    )
    last_update = fields.Datetime(
        compute="_compute_last_update",
        store=False,
        help="Displays the last known update time."
    )

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

    @api.model_create_multi
    def create(self, vals_list):
        records = super(MaintenanceEquipment, self).create(vals_list)
        for vals, record in zip(vals_list, records):
            try:
                record.create_traccar(vals)
            except UserError as e:
                record.unlink()
                raise e
        return records

    def create_traccar(self, vals):
        traccar = TraccarAPI(self.env)
        response = traccar.post("api/devices",
                                json={"uniqueId": vals.get("serial_no"), "name": vals.get("name")})

        if response.status_code != 200:
            raise UserError(_("Another asset already exists with this serial number!"))

    def unlink(self):
        for record in self:
            try:
                traccar = TraccarAPI(self.env)
                response = traccar.get("api/devices")
                if response.status_code == 200:
                    devices = response.json()
                    device = next((dev for dev in devices if dev['uniqueId'] == record.serial_no), None)
                    if device:
                        traccar_device_id = device.get('id')
                        delete_response = traccar.delete(f"api/devices/{traccar_device_id}")
                        if delete_response.status_code == 204:
                            logger.info(
                                f"Device with serial number {record.serial_no} deleted from Traccar successfully.")
                        else:
                            logger.error(
                                f"Failed to delete device {record.serial_no} from Traccar: {delete_response.text}")
                    else:
                        logger.warning(f"Device with serial number {record.serial_no} not found in Traccar.")
            except Exception as e:
                logger.error(f"Error while deleting device from Traccar: {e}")
        return super(MaintenanceEquipment, self).unlink()
