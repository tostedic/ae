(function () {
    'use strict';

    function RezkaPlugin(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var items   = [];
        var extract = {};

        // Адрес вашего парсера (прокси), который обрабатывает запросы к hdrezka.ag
        var api_url = 'your-proxy-server.com'; 

        this.create = function () {
            var _this = this;
            
            // Получаем данные (например, поиск или карточка фильма)
            var url = api_url + encodeURIComponent(object.search || object.title);

            network.silent(url, function (data) {
                if (data.items && data.items.length) {
                    _this.build(data.items);
                } else {
                    _this.empty();
                }
            }, function () {
                _this.empty();
            });

            return this.render();
        };

        this.build = function (data) {
            var _this = this;
            data.forEach(function (item) {
                var card = Lampa.Template.get('card', item);
                card.on('hover:focus', function () {
                    Lampa.Background.change(item.background);
                });
                card.on('click:select', function () {
                    // Логика открытия плеера или выбора серии
                    Lampa.Player.play(item.video_url);
                });
                items.push(card);
            });
            scroll.append(items);
        };

        this.render = function () {
            return scroll.render();
        };

        this.empty = function () {
            // Экран, если ничего не найдено
            scroll.append(Lampa.Template.get('empty'));
        };
    }

    // Регистрация плагина в меню Lampa
    function startPlugin() {
        window.rezka_plugin = true;
        Lampa.Component.add('rezka', RezkaPlugin);

        // Добавляем кнопку в левое меню
        var menu_item = $('<li class="menu__item selector" data-action="rezka">' +
            '<div class="menu__ico"><svg>...</svg></div>' +
            '<div class="menu__text">HDRezka</div>' +
            '</li>');

        menu_item.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '',
                title: 'HDRezka',
                component: 'rezka',
                page: 1
            });
        });

        $('.menu .menu__list').append(menu_item);
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type == 'ready') startPlugin();
    });
})();
