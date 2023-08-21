export const index = [
    '',
    {
        text: '博文',
        icon: 'note',
        prefix: 'posts/',
        link: '/posts/',
        children: [
            {
                text: '计算机基础',
                icon: 'computer',
                prefix: 'cs-basic/',
                // collapsible: true,
                children: [
                    {
                        text: '计算机网络',
                        icon: 'network',
                        prefix: 'network/',
                        children: [
                        'computer-network-summary',
                        'osi-and-tcp-ip-model',
                        'tcp-connection-and-disconnection',
                        ],
                    },
                ]
            },
            {
                text: '工具',
                icon: 'Tools',
                prefix: 'tools/',
                children: [
                    {
                        text: '开发工具',
                        icon: 'tool',
                        prefix: 'develop/',
                        children: [
                        'idea-annotation-tempplate',
                        ],
                    },
                    {
                        text: '文本处理',
                        icon: 'tool',
                        prefix: 'text-process/',
                        children: [
                        'regex-summary',
                        ],
                    },
                ]
            },
        ],
    },
    {
        text: '收藏',
        icon: 'favoritea',
        link: '/favorite/',
        children: [
            {
                text: '影视',
                icon: 'movie',
                link: '/favorite/movies/',
            },
            {
                text: '音乐',
                icon: 'music',
                link: '/favorite/music/',
            },
            {
                text: '相册',
                icon: 'xiangce',
                link: '/favorite/photos/',
            },
            {
                text: '链接',
                icon: 'link',
                link: '/favorite/links/',
            },
        ],
    },
    {
        text: '关于',
        icon: 'info',
        prefix: 'about/',
        link: '/about/website.html',
        children: 'structure',
    },
];