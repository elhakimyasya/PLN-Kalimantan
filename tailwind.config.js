module.exports = {
    darkMode: 'class',
    content: [
        './src/**/*.html',
        './src/**/*.js',
        '*.html',
    ],
    theme: {
        extend: {
            boxShadow: {
                '2dp': '0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12)',
                '4dp': '0 2px 4px -1px rgba(0,0,0,.2),0 4px 5px 0 rgba(0,0,0,.14),0 1px 10px 0 rgba(0,0,0,.12)',
                '6dp': '0 3px 5px -1px rgba(0,0,0,.2),0 6px 10px 0 rgba(0,0,0,.14),0 1px 18px 0 rgba(0,0,0,.12)',
                '24dp': '0 11px 15px -7px rgba(0,0,0,.2),0 24px 38px 3px rgba(0,0,0,.14),0 9px 46px 8px rgba(0,0,0,.12)'
            },
            fontFamily: {
                sans: '"Fustat", ui-sans-serif, system-ui, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
            },
            colors: {
                colorKey: '#283593',
                colorBackground: '#FFFFFF',
                colorBackgroundAlt: '#F0F0F0',
                colorText: '#202124',
                colorMeta: '#5F6368',
                colorBorder: '#DADCE4',

                colorDarkKey: '#91a7ff',
                colorDarkBackground: '#202124',
                colorDarkBackgroundAlt: '#303336',
                colorDarkText: '#EAEAEA',
                colorDarkMeta: '#9AA0A6',
                colorDarkBorder: '#5F6368',
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
};
