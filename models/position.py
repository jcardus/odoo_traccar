from datetime import datetime, timedelta

from ..utils.traccar_api import TraccarAPI
from odoo import models, fields





class Position(models.TransientModel):
    _name = 'odoo_traccar.position'
    _description = 'Temporary model for displaying Traccar positions'

    device_id = fields.Char("Device ID")
    latitude = fields.Float("Latitude")
    longitude = fields.Float("Longitude")
    speed = fields.Float("Speed (knots)")
    fix_time = fields.Datetime("Fix time")
    attributes = fields.Text("Attributes")
    protocol = fields.Char("Protocol")

    def fetch_positions_from_traccar(self, device_id):
        traccar = TraccarAPI(self.env)
        twenty_four_hours_ago = datetime.now() - timedelta(days=2)
        current_time = datetime.now()

        # Format the timestamps as ISO 8601 (Traccar API expects this format)
        start_time = twenty_four_hours_ago.strftime('%Y-%m-%dT%H:%M:%SZ')  # Format to match the API
        end_time = current_time.strftime('%Y-%m-%dT%H:%M:%SZ')  # Current time

        # Build the query parameters to filter positions from the last 24 hours
        params = {
            'deviceId': device_id,  # Filter by device_id
            'from': start_time,     # Filter by timestamp (24 hours ago)
            'to': end_time,         # Filter by timestamp (current time)
        }

        response = traccar.get("api/positions", params=params)
        # Check for the success of the response and parse the data accordingly
        if response.status_code == 200:
            return response.json()  # Parse JSON response
        else:
            # Handle error if needed (log or raise)
            return []

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
                'attributes': position['attributes'],
                'protocol': position['protocol']
            })

        # Create the transient records
        self.create(position_records)

