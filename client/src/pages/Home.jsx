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

    queryUSDA = () => {
        document.getElementById('result').innerText = 'searching...'
        const theQuery = document.getElementById('query').value;
        API.queryUSDA(theQuery)
            .then((result) => {
                if (result.data.length) {
                    console.log('no result');
                    document.getElementById('result').innerText = 'no result'
                } else {
                    const theIngredients = result.data.foods[ 0 ].food.ing.desc
                    if (theIngredients.indexOf('SUGAR') > 0) { alert('sugar!'); };
                    document.getElementById('result').innerText = theIngredients
                }
                return false;
            })
            .catch(err => console.log(err));
    };

    render () {
        return (
            <div>
                <input id='query' defaultValue='00014885'></input>
                <br />
                <input type="file" accept="image/*" capture="camera" />
                <br />
                <button onClick={ this.queryUSDA }>button</button>
                <br />
                <div id='result'></div>
            </div>
        );
    }
};

export default Home;