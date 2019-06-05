import React, { Component } from 'react';
import API from "../utils/API";

let timeout = Date.now() + 1000;

class Home extends Component {
    constructor (props) {
        super(props);
        this.state = {
            watchFor: ''
        };
    };

    componentDidMount () {
        document.getElementById("alert").value = localStorage.getItem("alert");
        this.setState({ watchFor: localStorage.getItem("alert") })
        document.getElementById("query").value = localStorage.getItem("query");
        const theScanButton = document.getElementById('scan');
        theScanButton.style.display = 'none';
    }

    barcodeChange = () => {
        this.hideScanner();
        localStorage.setItem("query", document.getElementById("query").value);
        console.log(document.getElementById("query").value);
        this.queryUSDA();
    }

    queryUSDA = () => {
        if (Date.now() < timeout) {
            // console.log('too soon');
        } else {
            // console.log('okay');
            timeout = Date.now() + 1000;

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
                        const theIngredients = this.highlightWords(result.data.foods[ 0 ].food.ing.desc);
                        // const theIngredients = result.data.foods[ 0 ].food.ing.desc;
                        // this.highlightWords(theIngredients);
                        // document.getElementById('result').innerHTML = theIngredients;
                        document.getElementById('result').innerHTML = '<strong>' + theName + '</strong><br />' + theIngredients + '<br /><br />' + theNutrientList;
                        let theAlertHits = [];
                        for (let i = 0; i < theIngredients.length; i++) {
                            if (theIngredients.indexOf(theAlerts[ i ]) > 0) {
                                theAlertHits.push(theAlerts[ i ]);
                            }
                        }
                        // if (theAlertHits.length > 0) {
                        //     setTimeout(function () {
                        //         alert('This product contains ' + theAlertHits.join(', ').toLowerCase());
                        //     }, 100);
                        // };
                    }
                    return false;
                })
                .catch(err => console.log(err));
        }
    };

    highlightWords = (theText) => {
        // let theText = document.getElementById('result').innerHTML;
        let theWordsToHighlight = this.state.watchFor.split(' ');
        for (let i = 0; i < theWordsToHighlight.length; i++) {
            let highlightWord = theWordsToHighlight[ i ];
            // console.log(highlightWord);
            var theExpression = new RegExp(highlightWord, "gi");
            theText = theText.replace(theExpression, `<span class="highlight">${highlightWord.toUpperCase()}</span>`);
            // console.log(theText);
        }
        return theText;
        // "the fox jumped over the other fox".replace(/fox/g, "<span>fox</span>");
    }

    showScanner = () => {
        const theContainer = document.getElementById("container");
        theContainer.style.display = 'block';
        const theScanButton = document.getElementById('scan');
        theScanButton.style.display = 'none';
        const theCancelButton = document.getElementById('cancel');
        theCancelButton.style.display = 'block';
    }

    hideScanner = () => {
        const theContainer = document.getElementById("container");
        theContainer.style.display = 'none';
        const theScanButton = document.getElementById('scan');
        theScanButton.style.display = 'block';
        const theCancelButton = document.getElementById('cancel');
        theCancelButton.style.display = 'none';
    }

    reload_js = () => {
        this.showScanner();
        try {
            document.getElementById('scanner-script').remove();
        }
        catch (err) {
            console.log(err.message);
        }
        finally {
            console.log('reloading');
            var script = document.createElement("script");
            script.type = "text/javascript";
            // script.src = "live_w_locator.js";
            script.src = "https://desmondmullen.com/static/live_w_locator.js";
            script.id = "scanner-script"
            document.head.appendChild(script);
        }
    }

    debounceEvent = () => {
        let interval;
        clearTimeout(interval);
        interval = setTimeout(() => {
            interval = null;
            this.storePrefs();
        }, 250);
    };

    storePrefs = () => {
        const key = 'watchFor';
        const value = document.getElementById("alert").value;
        localStorage.setItem("alert", value);
        this.setState({ [ key ]: value });
    }

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
                <div className="topbar">
                    FoodVetter
                </div>
                <section id="container" className="container">
                    <div id="interactive" className="viewport"></div>
                </section>
                <button id='scan' onClick={ this.reload_js }>Scan</button> <button id='cancel' onClick={ this.hideScanner }>Cancel</button>
                <br />
                <section id='body-text'>
                    <strong>Barcode:</strong> <input id='query' onChange={ this.barcodeChange } onClick={ this.barcodeChange } size="14"></input> <button onClick={ this.barcodeChange }>Search</button>
                    {/* <strong>Barcode:</strong> <input id='query' onChange={ this.barcodeChange } onClick={ this.barcodeChange } defaultValue='00014885' size="14"></input> <button onClick={ this.barcodeChange }>Search</button> */ }
                    <br />
                    <strong>Watch for:</strong> <input id='alert' onChange={ this.debounceEvent }></input>
                    <br />
                    <br />
                    <div id='result' width='100%'></div>
                    <br />
                    <strong>Examples:</strong>
                    <br />
                    <button onClick={ this.granola }>Granola</button> <button onClick={ this.bread }>Bread</button> <button onClick={ this.soup }>Soup</button> <button onClick={ this.cornbread }>Cornbread</button>
                </section>
                <div className="bottombar">
                    &copy;2019 <a id="desmondmullencomlink" href="https://desmondmullen.com" target="_blank" rel="noopener noreferrer">desmondmullen.com</a>
                </div>

            </div>
        );
    }
};

export default Home;