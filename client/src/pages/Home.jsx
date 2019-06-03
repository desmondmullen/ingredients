import React, { Component } from 'react';
import API from "../utils/API";

//---------------------------
$(document).ready(function () {
    var App = {
        init: function () {
            var self = this;
            Quagga.init(this.state, function (err) {
                if (err) {
                    return self.handleError(err);
                }
                App.initCameraSelection();
                Quagga.start();
            });
        },
        handleError: function (err) {
            console.log(err);
        },
        initCameraSelection: function () {
            var streamLabel = Quagga.CameraAccess.getActiveStreamLabel();

            return Quagga.CameraAccess.enumerateVideoDevices()
        },
        setState: function (path, value) {
            var self = this;
            if (path.startsWith('settings.')) {
                var setting = path.substring(9);
                return self.applySetting(setting, value);
            }
            console.log(JSON.stringify(self.state));
            Quagga.stop();
            App.init();
        },
        inputMapper: {
            inputStream: {
                constraints: function (value) {
                    if (/^(\d+)x(\d+)$/.test(value)) {
                        var values = value.split('x');
                        return {
                            width: { min: parseInt(values[ 0 ]) },
                            height: { min: parseInt(values[ 1 ]) }
                        };
                    }
                    return {
                        deviceId: value
                    };
                }
            },
            numOfWorkers: function (value) {
                return parseInt(value);
            },
            decoder: {
                readers: function (value) {
                    if (value === 'ean_extended') {
                        return [ {
                            format: "ean_reader",
                            config: {
                                supplements: [
                                    'ean_5_reader', 'ean_2_reader'
                                ]
                            }
                        } ];
                    }
                    return [ {
                        format: value + "_reader",
                        config: {}
                    } ];
                }
            }
        },
        state: {
            inputStream: {
                type: "LiveStream",
                constraints: {
                    width: { min: 1280 },
                    height: { min: 720 },
                    facingMode: "environment",
                    aspectRatio: { min: 1, max: 2 }
                }
            },
            locator: {
                patchSize: "large",
                halfSample: true
            },
            numOfWorkers: 2,
            frequency: 10,
            decoder: {
                readers: [ {
                    format: "upc_reader",
                    config: {}
                } ]
            },
            locate: true
        },
        lastResult: null
    };

    App.init();

    Quagga.onDetected(function (result) {
        var code = result.codeResult.code;
        Quagga.stop();
        if (App.lastResult !== code) {
            App.lastResult = code;
            document.getElementById("query").value(code);
            document.getElementById("container").css('display', 'none');
        }
    });
});
//---------------------------

class Home extends Component {
    constructor (props) {
        super(props);
        this.state = {
            latitude: 0,
            longitude: 0,
        };
    };

    barcodeChange = () => {
        alert('woo');
    }

    queryUSDA = () => {
        document.getElementById('result').innerText = 'searching...';
        const theQuery = document.getElementById('query').value;
        const theAlerts = ((document.getElementById('alert').value).toUpperCase()).split(' ');
        API.queryUSDA(theQuery)
            .then((result) => {
                if (result.data.length) {
                    console.log('no result');
                    document.getElementById('result').innerText = 'no result';
                } else {
                    console.log(result.data.foods[ 0 ].food.nutrients);
                    const theNutrients = result.data.foods[ 0 ].food.nutrients;
                    let theNutrientList = '<strong>Per ' + theNutrients[ 0 ].measures[ 0 ].qty + ' ' + theNutrients[ 0 ].measures[ 0 ].label + '</strong><br />';
                    for (let i = 0; i < theNutrients.length; i++) {
                        theNutrientList += theNutrients[ i ].name + ' ' + theNutrients[ i ].value + theNutrients[ i ].unit + '<br />';
                    }
                    const theName = result.data.foods[ 0 ].food.desc.name + ' ' + result.data.foods[ 0 ].food.desc.manu;
                    const theIngredients = result.data.foods[ 0 ].food.ing.desc;
                    document.getElementById('result').innerHTML = '<strong>' + theName + '</strong><br />' + theIngredients + '<br /><br />' + theNutrientList;
                    let theAlertHits = [];
                    for (let i = 0; i < theIngredients.length; i++) {
                        if (theIngredients.indexOf(theAlerts[ i ]) > 0) {
                            theAlertHits.push(theAlerts[ i ]);
                        }
                    }
                    if (theAlertHits.length > 0) {
                        setTimeout(function () {
                            alert('This product contains ' + theAlertHits.join(', ').toLowerCase());
                        }, 100);
                    };
                }
                return false;
            })
            .catch(err => console.log(err));
    };

    granola = () => {
        document.getElementById('query').value = '021908498263';
        this.queryUSDA();
    }

    bread = () => {
        document.getElementById('query').value = '073410013755';
        this.queryUSDA();
    }

    soup = () => {
        document.getElementById('query').value = '00290906';
        this.queryUSDA();
    }

    cornbread = () => {
        document.getElementById('query').value = '072486010040';
        this.queryUSDA();
    }

    render () {
        return (
            <div>
                <section id="container" className="container">
                    <div id="interactive" className="viewport"></div>
                </section>
                <strong>Barcode:</strong> <input id='query' defaultValue='00014885'></input>
                <br />
                <strong>Watch for:</strong> <input id='alert' defaultValue='onion'></input>
                <br />
                <button onClick={ this.queryUSDA }>Search</button>
                <br />
                <br />
                <div id='result' width='100%'></div>
                <br />
                <br />
                <strong>Examples:</strong>
                <br />
                <button onClick={ this.granola }>Granola</button>
                <br />
                <button onClick={ this.bread }>Bread</button>
                <br />
                <button onClick={ this.soup }>Soup</button>
                <br />
                <button onClick={ this.cornbread }>Cornbread</button>
            </div>
        );
    }
};

export default Home;