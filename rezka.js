(function () {
    'use strict';

    // Функция плагина, которую вызывает Lampa
    function RezkaPlugin(object) {
        var network = new Lampa.Reguest();
        var scroll  = new Lampa.Scroll({mask: true, over: true});
        var items   = [];

        // АКТУАЛЬНЫЙ АДРЕС ПАРСЕРА (НА ЯНВАРЬ 2026 ГОДА)
        // Этот адрес используется для запросов к HDRezka через прокси
        var api_url = 'jacked.xyz'; 

        // Метод, который Lampa вызывает для инициализации плагина
        this.create = function () {
            var _this = this;
            
            // Если передан поиск или тайтл, делаем запрос к API
            var search_query = object.search || object.title;
            if (search_query) {
                var url = api_url + '?story=' + encodeURIComponent(search_query);

                network.silent(url, function (data) {
                    if (data.items && data.items.length) {
                        _this.build(data.items);
                    } else {
                        _this.empty();
                    }
                }, function () {
                    _this.empty();
                });
            } else {
                // Здесь можно добавить логику для вывода популярных фильмов, если запрос пуст
                _this.empty(); 
            }

            return this.render();
        };

        // *ИСПРАВЛЕНИЕ ОШИБКИ* this.component.start is not a function
        // Некоторые версии Lampa используют метод start() вместо create()
        this.start = function() {
            this.create();
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
            '<div class="menu__ico"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 12.5V9.5L16 12l-5 3.5z""")/>></svg></div>' +
            '<div class="menu__text">HDRezka</div>' +
            '</li>'); // Добавлена простая иконка SVG

        menu_item.on('hover:enter', function () {
            Lampa.Activity.push({
                url: '', // URL пустой, так как данные грузит сам плагин
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
