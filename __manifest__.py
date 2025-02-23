{
    'name': 'odoo_traccar',
    'version': '0.1',
    'summary': 'Main module',
    'depends': [
        'fleet_vehicle_calendar_year',
        'fleet_vehicle_category',
        'fleet_vehicle_configuration',
        'fleet_vehicle_fuel_capacity',
        'fleet_vehicle_history_date_end',
        'fleet_vehicle_inspection',
        'fleet_vehicle_inspection_template',
        'fleet_vehicle_log_fuel',
        'fleet_vehicle_service_activity',
        'fleet_vehicle_service_calendar',
        'fleet_vehicle_service_kanban',
        'fleet_vehicle_service_services',
        'fleet_vehicle_usage'
    ],
    'auto_install': [],
    'application': True,
    'installable': True,
    'data': [
        'views/views.xml'
    ],
    'assets': {
        'web.assets_backend': [
            'odoo_traccar/static/src/**/*',
        ],
    },
}
