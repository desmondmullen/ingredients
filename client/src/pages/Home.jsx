import React, { Component } from 'react';
import API from "../utils/API";
import Modal from "../components/Modal/Modal";
import parse from 'html-react-parser';

let timeout = Date.now() + 1000;

class Home extends Component {
    constructor (props) {
        super(props);
        this.state = {
            theQuery: '',
            theWatchlist: '',
            theName: '',
            theNameClass: 'bold display-name',
            theIngredients: '',
            theIngredientsHighlighted: '',
            show: false,
        };
    }

    showModal = e => {
        this.setState({
            show: !this.state.show
        });
    };

    componentDidMount () {
        const theWatchlist = localStorage.getItem("theWatchlist");
        const theQuery = localStorage.getItem("theQuery");
        document.getElementById("watchlist").value = theWatchlist;
        document.getElementById("query").value = theQuery;
        this.setState({ theWatchlist: theWatchlist || 'fizzbuzz', theQuery: theQuery })
        const theScanButton = document.getElementById('scan');
        theScanButton.style.display = 'none';
    }

    barcodeChange = () => {
        if (document.activeElement.id !== 'watchlist') {
            this.hideScanner();
            this.storePrefs();
            this.setState({ theNameClass: 'bold display-name' });
            this.queryUSDA();
        }
    }

    queryUSDA = () => {
        // console.log('queryUSDA');
        if (Date.now() < timeout) {
            // console.log('too soon');
        } else {
            timeout = Date.now() + 1000;
            this.setState({ theName: '', theIngredients: '', theIngredientsHighlighted: 'searching...' })
            const theQuery = document.getElementById('query').value;
            API.queryUSDA(theQuery)
                .then((result) => {
                    if (result.data.length) { //undefined length means data
                        this.setState({ theIngredientsHighlighted: 'no result' })
                    } else {
                        if (/^\d+$/.test(theQuery)) { // true if its numbers
                            const theName = result.data.foods[ 0 ].food.desc.name + ' ' + result.data.foods[ 0 ].food.desc.manu;
                            const theIngredients = result.data.foods[ 0 ].food.ing.desc;
                            this.setState({ theName: theName, theIngredients: theIngredients })
                            this.highlightWords();
                        } else { // it was a word search
                            const theMatches = result.data.list.item;
                            if (theMatches.length <= 50) {
                                const theResultCount = 'Matches: ' + theMatches.length;
                                this.setState({ theName: theResultCount })
                            } else {
                                const theResultCount = '<em>More than 50 matches were returned, only showing the first 50</em>';
                                this.setState({ theName: theResultCount })
                            }
                            let theMatchesList = '';
                            for (let i = 0; i < theMatches.length; i++) {
                                theMatchesList += `<button name=${theMatches[ i ].ndbno} class='list-item'>${theMatches[ i ].name}</button><br />`;
                            }
                            this.setState({ theIngredientsHighlighted: theMatchesList });
                            this.attachListeners();
                        }
                        return false;
                    }
                })
                .catch(err => console.log(err));
        }
    };

    attachListeners = () => {
        var theButtons = document.querySelectorAll('.list-item');
        for (var i = 0; i < theButtons.length; i++) {
            var self = theButtons[ i ];
            self.addEventListener('click', (event) => {
                document.getElementById('query').value = event.target.name;
                this.queryUSDA();
            }, false);
        }
    }

    highlightWords = () => {
        let theText = this.state.theIngredients;
        const theWatchlist = document.getElementById("watchlist").value.trim();
        let theWordsToHighlight = theWatchlist.split(' ');
        for (let i = 0; i < theWordsToHighlight.length; i++) {
            let highlightWord = theWordsToHighlight[ i ].trim();
            if (highlightWord.length > 1 && highlightWord.indexOf("..") < 0) {
                var theExpression = new RegExp(highlightWord, "gi");
                theText = theText.replace(theExpression, `<span class="highlight">${highlightWord.toUpperCase()}</span>`);
            }
        }
        let theNameClass = '';
        if (theText.indexOf('<span') !== -1) {
            theNameClass = 'highlight display-name';
        } else {
            theNameClass = 'bold display-name';
        }
        this.setState({ theIngredientsHighlighted: theText, theNameClass: theNameClass });
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
        if (e.target.id === 'query') {
            // let interval;
            // clearTimeout(interval);
            // interval = setTimeout(() => {
            //     interval = null;
            //     this.queryUSDA();
            // }, 500);
        } else {
            this.highlightWords();
            let interval;
            clearTimeout(interval);
            interval = setTimeout(() => {
                interval = null;
                this.storePrefs();
            }, 250);
        }
    };

    handleSubmit = (event) => {
        event.preventDefault();
        if (document.activeElement.id === 'query' || document.activeElement.id === 'btn-search') {
            this.barcodeChange();
        } else {
            if (this.state.theIngredients.indexOf('<button>') !== -1) {
                // if we're not looking at a list of matches to a word query
                this.highlightWords();
            }
        }
    }

    storePrefs = () => {
        const theQuery = document.getElementById("query").value.trim();
        const theWatchlist = document.getElementById("watchlist").value.trim();
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
                    <span className='title'>FoodVetter</span><button id='btn-quickstart' onClick={ e => { this.showModal() } }>Quick Start</button>
                </div>
                <Modal show={ this.state.show } title='Quick Start'>
                    Scan a food barcode for a list of ingredients. Any word(s) you have entered in the <em>Watchlist</em> will instantly be highlighted in the list of ingredients.<br /><br />Add individual words like "salt" or "wheat" or "fructose" to your Watchlist - anything you want <em>FoodVetter</em> to highlight for you.<br />When adding words, separate them with a space but no comma.<br /><br />You can manually enter a barcode number to search. Better yet, enter part of a product name to search by name!<br /><br /><button className='modal-btn' onClick={ e => { this.showModal() } }>Close</button>
                </Modal>
                <section id="container" className="container">
                    <div id="interactive" className="viewport"></div>
                </section>
                <button id='scan' onClick={ this.reload_js }>Scan Barcode</button> <button id='cancel' onClick={ this.hideScanner }>Cancel Scan</button>
                <br />
                <section id='body-text'>
                    <form onSubmit={ this.handleSubmit }>
                        <div class='search'><strong>Barcode or Name search:</strong><br /><input id='query' type="text" onChange={ this.debounceEvent } size="20"></input> <button id='btn-search' onClick={ this.barcodeChange }>Search</button></div>
                        <br />
                        <div class='watchlist'><strong>Watchlist (separate with space):</strong><br /><textarea id='watchlist' type="text" onChange={ this.debounceEvent }></textarea></div>
                    </form>
                    <br />
                    <hr />
                    <div className={ this.state.theNameClass }>{ parse(this.state.theName) }</div>
                    <div>{ parse(this.state.theIngredientsHighlighted) }</div>
                    {/* <div id='result' width='100%'></div> */ }
                    <hr />
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