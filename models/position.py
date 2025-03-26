from odoo import models, fields


def fetch_positions_from_traccar(device_id):
    # Example: Fetching positions via the Traccar API (you should replace this with your actual code)
    return [
        {'device_id': device_id, 'latitude': 40.7128, 'longitude': -74.0060, 'speed': 50.0, 'timestamp': fields.Datetime.now()},
        {'device_id': device_id, 'latitude': 41.7128, 'longitude': -74.0060, 'speed': 50.0, 'timestamp': fields.Datetime.now()},
        {'device_id': device_id, 'latitude': 42.7128, 'longitude': -74.0060, 'speed': 50.0, 'timestamp': fields.Datetime.now()},
        {'device_id': device_id, 'latitude': 43.7129, 'longitude': -74.0059, 'speed': 52.0, 'timestamp': fields.Datetime.now()},
        {'device_id': device_id, 'latitude': 44.7129, 'longitude': -74.0059, 'speed': 52.0, 'timestamp': fields.Datetime.now()},
    ]


class Position(models.TransientModel):
    _name = 'odoo_traccar.position'
    _description = 'Temporary model for displaying Traccar positions'

    device_id = fields.Char("Device ID")
    latitude = fields.Float("Latitude")
    longitude = fields.Float("Longitude")
    speed = fields.Float("Speed (km/h)")
    timestamp = fields.Datetime("Timestamp")

    def create_position(self, device_id):
        # Fetch the positions for the given device from the Traccar API or any other source
        positions = fetch_positions_from_traccar(device_id)

        # Create records in the transient model
        position_records = []
        for position in positions:
            position_records.append({
                'device_id': position['device_id'],
                'latitude': position['latitude'],
                'longitude': position['longitude'],
                'speed': position['speed'],
                'timestamp': position['timestamp'],
            })

        # Create the transient records
        self.create(position_records)

