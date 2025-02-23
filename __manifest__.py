{
    'name': 'odoo_traccar',
    'version': '0.1',
    'summary': 'Main module',
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
