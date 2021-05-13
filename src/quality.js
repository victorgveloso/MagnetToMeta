module.exports = {
    key: 'qualityfilter',
    options: [{
            key: '4k',
            label: '4k',
            items: ['4k'],
            test: (quality) => this.items.includes(quality)
        },
        {
            key: '1080p',
            label: '1080p',
            items: ['1080p'],
            test: (quality) => this.items.includes(quality)
        },
        {
            key: '720p',
            label: '720p',
            items: ['720p'],
            test: (quality) => this.items.includes(quality)
        },
        {
            key: '480p',
            label: '480p',
            items: ['480p'],
            test: (quality) => this.items.includes(quality)
        },
        {
            key: 'other',
            label: 'Other (DVDRip/HDRip/BDRip...)',
            // could be ['DVDRip', 'HDRip', 'BDRip', 'BRRip', 'BluRay', 'WEB-DL', 'WEBRip', 'HDTV', 'DivX', 'XviD']
            items: ['4k', '1080p', '720p', '480p', 'SCR', 'CAM', 'TeleSync', 'TeleCine'],
            test: (quality) => quality && !this.items.includes(quality)
        },
        {
            key: 'scr',
            label: 'Screener',
            items: ['SCR'],
            test: (quality) => this.items.includes(quality)
        },
        {
            key: 'cam',
            label: 'Cam',
            items: ['CAM', 'TeleSync', 'TeleCine'],
            test: (quality) => this.items.includes(quality)
        },
        {
            key: 'unknown',
            label: 'Unknown',
            test: (quality) => !quality
        }
    ]
}