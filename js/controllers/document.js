define([
    'lib/flight.min',
    'data',
    'templates',
], function (Flight, Data, Templates) {
    function component() {
        this.defaultAttrs({
            'settings-button': "#settings-button"
        });

        this.after("initialize", function (el) {

            var that = this;
            var notificationTimer = null;
            var minuteTimer = null;
            var originalTitle = el.title;

            function startTimer() {
                stopTimer();
                minuteTimer = setInterval(function () {
                    Data.reduceMinutes();
                    that.trigger("tasks:update");
                }, 60 * 1000);
            }

            function stopTimer() {
                clearTimeout(minuteTimer);
            }

            this.on("click", {
                'settings-button': function (e) {
                    $("body").toggleClass("settings").removeClass("credentials");
                    e.preventDefault();
                }
            });

            this.on("tasks:pause", function () {
                stopTimer();
                Data.setActive(null);
                this.trigger("tasks:update");
            });

            this.on("task:play", function () {
                var task = Data.active();
                startTimer();
                this.trigger("favicon:update");
            });

            this.on("task:complete", function (evt, task) {
                Data.setActive(null);
                this.trigger("tasks:update");
                this.trigger("notification:complete");
                if (Data.credentials()) {
                    this.trigger("tasks:save");
                }
            });

            this.on("tasks:update", function (evt, task) {
                if (Data.active()) {
                    var active = Data.active();
                    if (active.minutes > 1) {
                        this.trigger("tasks:save");
                    }
                }
                this.trigger("title:update");
            });

            this.on("title:update", function () {
                if (Data.active()) {
                    el.title = Data.active().title;
                } else {
                    el.title = originalTitle;
                }
            });

            this.on("favicon:update", function () {
                var active = Data.active();
                if (active && active._minutes && active.minutes) {
                    var progress = Math.floor(100 * (1 - (active.minutes / active._minutes)));
                    Piecon.setProgress(progress);
                } else {
                    Piecon.reset();
                }
            });

            this.on("notification:complete", function () {
                var t = originalTitle;
                var nt = t + " " + Templates.check;
                var count = 10;
                var sound = new Howl({
                    urls: ['audio/done.mp3', 'audio/done.ogg']
                }).play();

                clearTimeout(notificationTimer);
                notificationTimer = setInterval(function () {
                    if (count > 0 && count % 2 == 0) {
                        document.title = nt;
                    } else if (count > 0 && count % 2 == 1) {
                        document.title = t;
                    } else {
                        clearTimeout(i);
                        document.title = t;
                    }
                    count--;
                }, 1000);
            });

            this.on("tasks:open", function () {
                this.trigger("credentials:check", {
                    action: "open",
                    callback: function () {}
                });
            });

            this.on("tasks:save", function () {
                this.trigger("credentials:check", {
                    action: "save",
                    callback: function () {}
                });
            });

            this.on("credentials:check", function (evt, object) {
                var callback = object.callback;
                var action = object.action;
                $("body").removeClass("settings");
                if (!Data.credentials()) {
                    this.trigger("credentials:setup", {
                        action: action,
                        callback: function () {
                            this.trigger("credentials:check", callback);
                        }
                    });
                } else {
                    this.trigger("credentials:hide");
                    this.trigger("credentials:" + action, Data.credentials());
                }
            });

            Data.load();

            this.trigger("tasks:import");

            startTimer();
        });
    }
    return Flight.component(component);
});