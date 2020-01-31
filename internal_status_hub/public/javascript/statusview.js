window.statusHub = window.statusHub || {};

(function() {
    let self = this;

    self.init = function() {
        console.log('STATUS init');

        self.version = null;

        self.$statusContainer = jQuery('#status-information');
        self.$refreshTime = jQuery('#refresh-time');

        self.healthCheckTemplate = ejs.compile(document.getElementById('health-check-template').innerText);

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
            url: 'http://status-qa.dev.pason.com:3000/rest/service_data',
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

            for (let category of Object.keys(data.services)) {
                let $category = self.$statusContainer.find(`.status-category[data-category="${category}"]`);
                if (!$category[0]) {
                    $category = jQuery(self.healthCheckTemplate({
                        isParent: true,
                        parent: category,
                        title: data.categories[category]
                    }));
                    self.$statusContainer.append($category);

                    $category.find('.expand-category').click(function(e) {
                        jQuery(this).addClass('hidden').parent().find('.collapse-category').removeClass('hidden');
                        $category.find('.child-statuses').removeClass('hidden');
                        $category.find('.category-chart').addClass('hidden');
                    });
                    $category.find('.collapse-category').click(function(e) {
                        jQuery(this).addClass('hidden').parent().find('.expand-category').removeClass('hidden');
                        $category.find('.child-statuses').addClass('hidden');
                        $category.find('.category-chart').removeClass('hidden');
                    });
                }

                let categoryStatus = [];
                for (let i = 0; i < 100; i++) {
                    categoryStatus.push(null);
                }

                for (let serviceID of Object.keys(data.services[category])) {
                    let service = data.services[category][serviceID];
                    let healthy = 0;
                    let maxTime = -1;
                    service.checks.sort((a, b) => a.time < b.time ? -1 : 1);
                    for (let check of service.checks) {
                        if (check.healthy) {
                            healthy++;
                        }
                        if (check.time > maxTime) {
                            maxTime = check.time;
                        }
                    }
                    let uptime = (healthy / service.checks.length * 100).toFixed(2);
                    while (service.checks.length < 100) {
                        service.checks.unshift({time: null, healthy: null});
                    }

                    for (let i = 0; i < 100; i++) {
                        // null - grey
                        // 1 - green
                        // 2 - orange
                        // 3 - red
                        if (service.checks[i].healthy !== null) {
                            if (categoryStatus[i] === null) {
                                categoryStatus[i] = service.checks[i].healthy ? 1 : 2;
                            } else if (categoryStatus[i] === 1 && !service.checks[i].healthy) {
                                categoryStatus[i] = 2;
                            } else if (categoryStatus[i] === 2 && !service.checks[i].healthy) {
                                categoryStatus[i] = 3;
                            }
                        }
                    }


                    let $service = $category.find(`.service-health[data-service="${serviceID}"]`);
                    if (!$service[0]) {
                        // create
                        $service = jQuery(self.healthCheckTemplate({
                            isParent: false,
                            service: service,
                            maxTime: maxTime
                        }));
                        $category.find('.child-statuses').append($service);
                    } else {
                        // update
                    }

                    $service.find('.uptime').text(`Uptime: ${uptime}%`);
                }
                // update category colours here
                let colorClass = {
                    'null': 'gray',
                    1: 'green',
                    2: 'orange',
                    3: 'red'
                };

                for (let i = 0; i < 100; i++) {
                    let rect = $category.find('.category-chart .status-chart div')[i];
                    jQuery(rect).removeClass().addClass(colorClass[categoryStatus[i]]);
                }
            }
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

