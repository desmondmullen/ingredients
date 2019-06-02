import React, { Component } from 'react';
import API from "../utils/API";

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
                    {/* <div className="controls">
                        <fieldset className="input-group"> */}
                    {/* <button className="stop">Stop</button> */ }
                    {/* </fieldset>
                    </div> */}
                    <div id="result_strip">
                        <ul className="thumbnails"></ul>
                        <ul className="collector"></ul>
                    </div>
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
                <br />

            </div>
        );
    }
};

export default Home;