import logging
import re
from datetime import datetime
from odoo import models, fields, api, _
from odoo.exceptions import UserError
from ..utils.traccar_api import TraccarAPI

logger = logging.getLogger(__name__)

class MaintenanceEquipment(models.Model):
    _inherit = 'maintenance.equipment'

    latitude = fields.Float()
    serial_no = fields.Char(
        required=True
    )
    last_update = fields.Datetime(
        compute="_compute_last_update",
        store=False,
        help="Displays the last known update time."
    )

    def _compute_last_update(self):
        for record in self:
            record.last_update = False
        try:
            traccar = TraccarAPI(self.env)
            response = traccar.get("api/devices")
            if response.status_code == 200:
                devices = {dev['uniqueId']: dev for dev in response.json()}
                for record in self:
                    device = devices.get(record.serial_no)
                    if device and device['lastUpdate']:
                        record.last_update = datetime.strptime(
                            re.sub(r'[+\-]\d{2}:\d{2}|Z', '', device['lastUpdate']),
                            "%Y-%m-%dT%H:%M:%S.%f"
                        )

        except Exception as e:
            logger.error(f"Error fetching data: {str(e)}")

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
