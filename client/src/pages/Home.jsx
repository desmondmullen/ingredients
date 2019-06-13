import React, { Component } from 'react';
import API from "../utils/API";
import parse from 'html-react-parser';

let timeout = Date.now() + 1000;

class Home extends Component {
    constructor (props) {
        super(props);
        this.state = {
            theQuery: '',
            theWatchlist: '',
            theName: '',
            theIngredients: '',
            theIngredientsHighlighted: ''
        };
    };

    componentDidMount () {
        const theWatchlist = localStorage.getItem("theWatchlist");
        const theQuery = localStorage.getItem("theQuery");
        console.log('theQuery: ' + localStorage.getItem("theQuery"));
        document.getElementById("watchlist").value = theWatchlist;
        document.getElementById("query").value = theQuery;
        this.setState({ theWatchlist: theWatchlist || 'fizzbuzz', theQuery: theQuery })
        const theScanButton = document.getElementById('scan');
        theScanButton.style.display = 'none';
    }

    barcodeChange = () => {
        this.hideScanner();
        localStorage.setItem("theQuery", document.getElementById("query").value);
        console.log(document.getElementById("query").value);
        this.queryUSDA();
    }

    queryUSDA = () => {
        if (Date.now() < timeout) {
            // console.log('too soon');
        } else {
            timeout = Date.now() + 1000;

            document.getElementById('result').innerText = 'searching...';
            const theQuery = document.getElementById('query').value;
            API.queryUSDA(theQuery)
                .then((result) => {
                    if (result.data.length) {
                        console.log('no result');
                        document.getElementById('result').innerText = 'no result';
                    } else {
                        if (/^\d+$/.test(theQuery)) { // true if its numbers
                            const theName = result.data.foods[ 0 ].food.desc.name + ' ' + result.data.foods[ 0 ].food.desc.manu;
                            const theIngredients = result.data.foods[ 0 ].food.ing.desc;
                            this.setState({ theName: theName, theIngredients: theIngredients })
                            this.highlightWords();
                            document.getElementById('result').innerHTML = '';
                        } else { // it was a word search
                            const theMatches = result.data.list.item;
                            if (theMatches.length <= 50) {
                                document.getElementById('result').innerHTML = '<strong>Matches: ' + theMatches.length + '</strong></br>';
                            } else {
                                document.getElementById('result').innerHTML = '<strong><em>More than 50 matches were returned, only showing the first 50</em></<strong></br>';
                            }
                            for (let i = 0; i < theMatches.length; i++) {
                                document.getElementById('result').innerHTML += `<button name=${theMatches[ i ].ndbno} onclick="document.getElementById('query').value=this.name;document.getElementById('query').click()" class='list-item'>${theMatches[ i ].name}</button><br />`;
                            }
                        }
                        return false;
                    }
                })
                .catch(err => console.log(err));
        }
    };

    enterNdbnoAndQuery = (ndbno) => {
        document.getElementById('query').value = ndbno;
        this.queryUSDA();
    }

    highlightWords = () => {
        let theText = this.state.theIngredients;
        let theWatchlist = this.state.theWatchlist;
        let theWordsToHighlight = theWatchlist.split(' ');
        for (let i = 0; i < theWordsToHighlight.length; i++) {
            let highlightWord = theWordsToHighlight[ i ].trim();
            if (highlightWord.length > 1 && highlightWord.indexOf("..") < 0) {
                var theExpression = new RegExp(highlightWord, "gi");
                theText = theText.replace(theExpression, `<span class="highlight">${highlightWord.toUpperCase()}</span>`);
            }
        }
        this.setState({ theIngredientsHighlighted: theText });
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
        document.getElementById("cancel").click();
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

    debounceEvent = (e) => {
        console.log(e.target.id);
        if (e.target.id === 'query') {
            let interval;
            clearTimeout(interval);
            interval = setTimeout(() => {
                interval = null;
                this.queryUSDA();
            }, 500);
        } else {
            let interval;
            clearTimeout(interval);
            interval = setTimeout(() => {
                interval = null;
                this.storePrefs();
            }, 500);
        }
    };

    handleSubmit = (event) => {
        event.preventDefault();
        // if (event.target.id === 'query') {
        this.barcodeChange();
        // } else {

        // }
    }

    storePrefs = () => {
        const theQuery = document.getElementById("query").value.trim();
        const theWatchlist = document.getElementById("watchlist").value.trim();
        this.highlightWords();
        localStorage.setItem("theQuery", theQuery);
        localStorage.setItem("theWatchlist", theWatchlist);
        this.setState({ theQuery: theQuery, theWatchlist: theWatchlist });
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
                    <form onSubmit={ this.handleSubmit }>
                        <strong>Barcode:</strong> <input id='query' onChange={ this.debounceEvent } onClick={ this.barcodeChange } size="14"></input> <button id='btn-search' onClick={ this.barcodeChange }>Search</button>
                        <br />
                        <strong>Watchlist:</strong> <input id='watchlist' onChange={ this.debounceEvent }></input>
                    </form>
                    <br />
                    <br />

                    <div className='bold' width='100%'>{ this.state.theName }</div>
                    <div>{ parse(this.state.theIngredientsHighlighted) }</div>
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