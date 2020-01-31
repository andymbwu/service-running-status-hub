window.statusHub = window.statusHub || {};

(function() {
    let self = this;

    self.init = function() {
        console.log('STATUS init');

        self.version = null;

        self.$statusContainer = jQuery('#status-information');
        self.$refreshTime = jQuery('#refresh-time');

        self.healthCheckTemplate = ejs.compile(document.getElementById('health-check-template').innerText);
        self.environment = jQuery('#env-buttons').attr('data-environment').toUpperCase();

        self.lastRefresh = new Date();
        self.timeFormatter = new Intl.RelativeTimeFormat('en', {
            numeric: 'always',
            style: 'long'
        });

        self.initialState = self.getSerialization();
        self.refresh(() => {
            self.applySerialization(self.initialState);
        });

        self.updateRefreshTime();
        setInterval(self.refresh, 60000); // refresh every 60s
        setInterval(self.updateRefreshTime, 1000);

        var myElement = document.getElementById("status-information");
        Sortable.create(myElement, {onSort:self.onSort});


    };

    // Called by any change to the list (add / update / remove)
	self.onSort = function () {
		self.serialize();
	}

    self.getData = function(callback) {
        jQuery.ajax({
            method: 'GET',
            url: 'rest/service_data',
            dataType: 'json',
            success: function(data) {
                callback(data);
            }
        });
    };

    self.refresh = function(cb) {
        self.getData(data => {
            self.lastRefresh = new Date();
            let serialization = self.serialize();
            self.$statusContainer.find('.status-category').remove();
            let windowStart = Date.now() - (1000 * 60 * 60 * 100);
            let step = 1000 * 60 * 60;

            if (!self.version) {
                self.version = data.version;
            } else if (self.version !== data.version) {
                // server updated
                window.location.reload();
                return;
            }

            for (let category of Object.keys(data.services)) {
                let categoryServices = 0;
                let categoryMax = -1;
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
                        $category.find('.category-age').addClass('hidden');
                        $category.attr('data-expanded', '1');
                        self.serialize();
                    });
                    $category.find('.collapse-category').click(function(e) {
                        jQuery(this).addClass('hidden').parent().find('.expand-category').removeClass('hidden');
                        $category.find('.child-statuses').addClass('hidden');
                        $category.find('.category-chart').removeClass('hidden');
                        $category.attr('data-expanded', '0');
                        $category.find('.category-age').removeClass('hidden');
                        self.serialize();
                    });
                }

                let categoryStatus = [];
                for (let i = 0; i < 100; i++) {
                    categoryStatus.push(0);
                }

                for (let serviceID of Object.keys(data.services[category])) {
                    let service = data.services[category][serviceID];
                    if (service.rule.environment !== self.environment) {
                        continue;
                    } else {
                        categoryServices++;
                    }
                    let healthy = 0;
                    let maxTime = -1;
                    let start = windowStart;
                    let end = start + step;
                    service.checks.sort((a, b) => a.time < b.time ? -1 : 1);

                    let checks = [];
                    if (service.rule.type === 'POLLING') {
                        for (let i = 0; i < 100; i++) {
                            let dataPoints = service.checks.filter(check => (check.time >= start && check.time < end));
                            let health = 0;
                            let messages = [];
                            for (let dataPoint of dataPoints) {
                                if (dataPoint.healthy) {
                                    healthy++;
                                }
                                if (dataPoint.time > maxTime) {
                                    maxTime = dataPoint.time;
                                }
                                if (dataPoint.time > categoryMax) {
                                    categoryMax = dataPoint.time;
                                }
                                if (dataPoint.healthy === true && health === 0) {
                                    health = 1;
                                } else if (dataPoint.healthy === false && health === 0) {
                                    health = 2;
                                    if (dataPoint.message) messages.push(dataPoint.message);
                                } else if (dataPoint.healthy === false) {
                                    health++;
                                    if (dataPoint.message) messages.push(dataPoint.message);
                                }
                            }
                            checks[i] = {time: start, health: health, messages: messages};

                            start = end;
                            end += step;
                        }
                    } else if (service.rule.type === 'REPORTING') {
                        let lastCheck = -1;
                        for (let i = 0; i < 100; i++) {
                            let dataPoints = service.checks.filter(check => (check.time >= start && check.time < end));
                            let health = 0;
                            let messages = [];
                            for (let dataPoint of dataPoints) {
                                if (dataPoint.healthy) {
                                    healthy++;
                                }
                                if (dataPoint.time > maxTime) {
                                    maxTime = dataPoint.time;
                                }
                                if (dataPoint.time > categoryMax) {
                                    categoryMax = dataPoint.time;
                                }
                                if (lastCheck === -1) {
                                    lastCheck = dataPoint.time;
                                }

                                if (dataPoint.healthy === true && health === 0) {
                                    health = 1;
                                } else if (dataPoint.healthy === false && health === 0) {
                                    health = 2;
                                    if (dataPoint.message) messages.push(dataPoint.message);
                                } else if (dataPoint.healthy === false) {
                                    health++;
                                    if (dataPoint.message) messages.push(dataPoint.message);
                                }

                                if (Math.abs((dataPoint.time - lastCheck)) > service.rule.interval) {
                                    // haven't heard in too long - fail
                                    messages.push('Service did not report within threshold');
                                    if (health < 2) {
                                        health = 2;
                                    } else {
                                        health++;
                                    }
                                }
                            }
                            checks[i] = {time: start, health: health, messages: [...new Set(messages)]};

                            start = end;
                            end += step;
                        }
                    }

                    // we have 100 datapoints. Extend grey points to the last check we have
                    for (let i = 0; i < checks.length; i++) {
                        if (checks[i].health === 0) {
                            for (let j = i; j >= 0; j--) {
                                if (checks[j].health !== 0) {
                                    checks[i].health = checks[j].health;
                                    checks[i].messages = checks[j].messages;
                                    checks[i].copied = true;
                                    break;
                                }
                            }
                        }
                    }

                    let uptime = (healthy / service.checks.length * 100).toFixed(2);
                    for (let i = 0; i < checks.length; i++) {
                        // 0 - grey
                        // 1 - green
                        // 2 - orange
                        // 3 - red
                        categoryStatus[i] += checks[i].health
                    }


                    let $service = $category.find(`.service-health[data-service="${serviceID}"]`);
                    if (!$service[0]) {
                        // create
                        for (let check of checks) {
                            check.messages = [...new Set(check.messages)];
                        }
                        $service = jQuery(self.healthCheckTemplate({
                            isParent: false,
                            service: service,
                            checks: checks,
                            maxTime: maxTime
                        }));
                        self.setIconFromHealth(checks[99].health, $service.find('.service-icon'))
                        $category.find('.child-statuses').append($service);
                    } else {
                        // update
                    }

                    $service.find('.uptime').text(`Uptime: ${uptime}%`);
                }

                if (categoryServices === 0) {
                    $category.remove();
                    continue;
                }
                // update category colours here
                let colorClass = {
                    0: 'gray',
                    1: 'green',
                    2: 'orange',
                    3: 'red'
                };

                for (let i = 0; i < 100; i++) {
                    let rect = $category.find('.category-chart .status-chart div')[i];
                    jQuery(rect).removeClass().addClass(
                        colorClass[categoryStatus[i]] || (categoryStatus[i] > 3 ? 'red' : 'gray')
                    );
                }
                $category.find('.category-age').text('as of ' + new Date(categoryMax).toLocaleString());
                self.setIconFromHealth(categoryStatus[99], $category.find('.category-icon'))
            }
            self.applySerialization();
            if (cb) cb();
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

    self.setIconFromHealth = function(health, $icon) {
        $icon.removeClass('question').removeClass('check').removeClass('x');
        switch(health) {
            case 0:
                $icon.addClass('question').attr('icon-color', 'gray');
                break;
            case 1:
                $icon.addClass('check').attr('icon-color', 'green');
                break;
            case 2:
                $icon.addClass('x').attr('icon-color', 'orange');
                break;
            default:
                $icon.addClass('x').attr('icon-color', 'red');
                break;
        }
    };

    self.serialize = function() {
        let serialization = [];
        jQuery('.status-category').each(function(i, e) {
            let cat = {
                category: jQuery(e).attr('data-category'),
                services: [],
                expanded: jQuery(e).attr('data-expanded') === '1'
            };
            jQuery(e).find('.service-health').each(function(i, e) {
                cat.services.unshift(jQuery(e).attr('data-service'))
            });
            serialization.unshift(cat);
        });

        Cookies.set(`state-${self.environment}`, JSON.stringify(serialization), {path: ''});

        return serialization;
    };

    self.getSerialization = function() {
        let serialization = Cookies.get(`state-${self.environment}`);
        if (serialization) {
            try {
                serialization = JSON.parse(serialization);
            } catch (e) {
                Cookies.set(`state-${self.environment}`, '', {path: ''})
                serialization = undefined;
            }
        }

        return serialization;
    };
    self.applySerialization = function(serialization) {
        if (!serialization) {
            serialization = self.getSerialization();
        }
        for (let cat of serialization) {
            let $cat = jQuery(`.status-category[data-category="${cat.category}"]`);
            if ($cat[0]) {
                $cat.parent().prepend($cat);

                if (cat.expanded) {
                    $cat.find('.expand-category').click();
                }
            }
        }
    }
}).apply(window.statusHub);

jQuery(document).ready(function() {
    window.statusHub.init();
});

