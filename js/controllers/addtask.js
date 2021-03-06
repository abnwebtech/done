define([
    'lib/flight.min'
], function (Flight) {
    function component() {
        var minutes = 15;

        function render_time(minutes) {
            var hours = Math.floor(minutes / 60);
            if ((hours == 1 && minutes % 60 == 0) || hours > 1) {
                return hours + "h";
            } else if (minutes < 120) {
                return minutes + "m";
            }
        }

        this.defaultAttrs({
            'add-button': ".taskbutton",
            'time-button': ".timebutton",
            'task-name': "#taskname",
            'task-time': "#tasktime",
            'task-time-area': '.tasktime'
        });

        this.after("initialize", function () {
            this.on("click", {
                'add-button': function (e) {
                    this.trigger("tasks:add", {
                        title: this.select('task-name').val(),
                        minutes: minutes,
                        _minutes: minutes
                    });
                    this.trigger("reset");
                    e.preventDefault();
                },
                'task-time-area': function (e) {
                    this.trigger(this.select('time-button'), "click");
                },
                'time-button': function (e) {
                    if (minutes >= 12 * 60) {
                        minutes = 15;
                    } else if (minutes < 60) {
                        minutes += 15;
                    } else if (minutes < 120) {
                        minutes += 30;
                    } else {
                        minutes += 60;
                    }
                    this.trigger("renderTime");
                    e.preventDefault();
                }
            });

            this.on("renderTime", function () {
                this.select('task-time').html($("<div />").html(render_time(minutes)).html());
            });

            this.on("reset", function (e) {
                minutes = 15;
                this.trigger("renderTime");
                this.select('task-name').val("");
                e.stopPropagation();
            });

            this.trigger("renderTime");
        });
    }
    return Flight.component(component);
}
);