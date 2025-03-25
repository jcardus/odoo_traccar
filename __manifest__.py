{
    'name': 'odoo_traccar',
    'version': '0.1',
    'summary': 'Main module',
    'depends': [
        'portal', 'auth_oauth', 'maintenance'
    ],
    'auto_install': [],
    'application': True,
    'installable': True,
    'data': [
        'data/oauth_provider_data.xml',
        'views/templates.xml',
        'views/remove_menus.xml',
        'views/views.xml'
    ],
    'assets': {
        'web.assets_backend': [
            'odoo_traccar/static/src/**/*',
        ],
    },
}
