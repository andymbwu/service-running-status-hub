window.statusHub = window.statusHub || {};

(function() {
    let self = this;

    self.init = function() {
        console.log('STATUS init');

        self.version = null;

        self.$statusContainer = jQuery('#status-information');
        self.$refreshTime = jQuery('#refresh-time');

        self.lastRefresh = new Date();
        self.timeFormatter = new Intl.RelativeTimeFormat('en', {
            numeric: 'always',
            style: 'long'
        });

        self.refresh();
        self.updateRefreshTime();
        setInterval(self.refresh, 60000); // refresh every 60s
        setInterval(self.updateRefreshTime, 1000);
    };

    self.getData = function(callback) {
        jQuery.ajax({
            method: 'GET',
            url: '/rest/service_data',
            dataType: 'json',
            success: function(data) {
                callback(data);
            }
        });
    };

    self.refresh = function() {
        self.getData(data => {
            self.lastRefresh = new Date();
            if (!self.version) {
                self.version = data.version;
            } else if (self.version !== data.version) {
                // server updated
                window.location.reload();
                return;
            }

            console.log(data);
        });
    };

    self.updateRefreshTime = function() {
        let elapsed = (new Date() - self.lastRefresh) / 1000;
        let unit = 'second';

        if (elapsed >= 60) {
            elapsed /= 60;
            unit = 'minute';
            if (elapsed >= 60) {
                elapsed /= 60;
                unit = 'hour';
                if (elapsed >= 24) {
                    elapsed /= 24;
                    unit = 'day';
                    if (elapsed >= 7) {
                        elapsed /= 7;
                        unit = 'week'
                        if (elapsed >= 30) {
                            elapsed /= 30;
                            unit = 'month';
                        }
                    }
                }
            }
        }

        let timestring = self.timeFormatter.format(Math.floor(elapsed) * -1, unit);
        self.$refreshTime.text(timestring);
    };
}).apply(window.statusHub);

jQuery(document).ready(function() {
    window.statusHub.init();
});

