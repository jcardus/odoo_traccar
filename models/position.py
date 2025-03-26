from datetime import datetime

from ..utils.traccar_api import TraccarAPI
from odoo import models, fields





class Position(models.TransientModel):
    _name = 'odoo_traccar.position'
    _description = 'Temporary model for displaying Traccar positions'

    device_id = fields.Char("Device ID")
    latitude = fields.Float("Latitude")
    longitude = fields.Float("Longitude")
    speed = fields.Float("Speed (km/h)")
    fix_time = fields.Datetime("Fix time")

    def fetch_positions_from_traccar(self, device_id):
        traccar = TraccarAPI(self.env)
        response = traccar.get("api/positions")
        # Check for the success of the response and parse the data accordingly
        if response.status_code == 200:
            return response.json()  # Parse JSON response
        else:
            # Handle error if needed (log or raise)
            return []

        # Example: Fetching positions via the Traccar API (you should replace this with your actual code) return [ {
        # 'device_id': device_id, 'latitude': 40.7128, 'longitude': -74.0060, 'speed': 50.0, 'timestamp':
        # fields.Datetime.now()}, {'device_id': device_id, 'latitude': 41.7128, 'longitude': -74.0060, 'speed': 50.0,
        # 'timestamp': fields.Datetime.now()}, {'device_id': device_id, 'latitude': 42.7128, 'longitude': -74.0060,
        # 'speed': 50.0, 'timestamp': fields.Datetime.now()}, {'device_id': device_id, 'latitude': 43.7129,
        # 'longitude': -74.0059, 'speed': 52.0, 'timestamp': fields.Datetime.now()}, {'device_id': device_id,
        # 'latitude': 44.7129, 'longitude': -74.0059, 'speed': 52.0, 'timestamp': fields.Datetime.now()}, ]

    def create_position(self, device_id):
        self.search([]).unlink()
        # Fetch the positions for the given device from the Traccar API or any other source
        positions = self.fetch_positions_from_traccar(device_id)

        # Create records in the transient model
        position_records = []
        for position in positions:
            position_records.append({
                'device_id': position['deviceId'],
                'latitude': position['latitude'],
                'longitude': position['longitude'],
                'speed': position['speed'],
                'fix_time': datetime.fromisoformat(position['fixTime']).replace(tzinfo=None),
            })

        # Create the transient records
        self.create(position_records)

