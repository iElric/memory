import React from 'react';
import ReactDOM from 'react-dom';
import _ from 'lodash';

export default function game_init(root) {
    // load this PairOfTiles react components into the root DOM
    ReactDOM.render(<PairOfTiles/>, root);
}

class PairOfTiles extends React.Component {
    constructor(props) {
        super(props);
        let tileArray = this.initTiles();
        this.state = {
            tiles: tileArray,
            isVisible: Array(16).fill(false),
            isClickable: Array(16).fill(true),
            // only register valid click
            numGuesses: 0,
            // store the previous click(first click), -1 means the next click should be first guess
            prevClickIndex: -1,
            // add allowClick to prevent a bug which you can click a lot of buttons in a row. This is mainly to solve
            // the setTimout side effect
            allowClick: true
        }
    }

    // generate an random array of length 16 with characters from A to H, each characters appear twice
    initTiles() {
        let tiles = ['A', 'A', 'B', 'B', 'C', 'C', 'D', 'D', 'E', 'E', 'F', 'F', 'G', 'G', 'H', 'H'];
        // Returns a shuffled copy of the list, using a version of the Fisher-Yates shuffle
        return _.shuffle(tiles);
    }

    // check if this is a first guess
    isFirstGuess() {
        return this.state.prevClickIndex === -1;
    }


    renderTile(index) {
        // pass the property to the function component, let the component decide how to render it
        return (
            // When React sees an element representing a user-defined component, it passes JSX attributes to this
            // component as a single object. We call this object “props”.
            <Tile value={this.state.tiles[index]} isVisible={this.state.isVisible[index]}
                  onTileClick={() => this.handleClick(index)}/>
        )
    }

    renderTiles(num) {
        //let that = this;
        let tiles = [];
        for (let i = 0; i < num; i++) {
            tiles.push(this.renderTile(i));
        }
        return tiles;
    }

    // bArray should be an boolean array, and index should be an index array, bool is true or false. Return a copy of
    // the bArray with every index in index array change to bool value.
    map(bArray, index, bool) {
        let copy = bArray.slice();
        _.each(index, i => {
            copy[i] = bool;
        });
        return copy;
    }

    reStart() {
        this.setState({
            tiles: this.initTiles(),
            isVisible: Array(16).fill(false),
            isClickable: Array(16).fill(true),
            numGuesses: 0,
            prevClickIndex: -1,
            allowClick: true
        })
    }

    // Control the difficulty of the game by change 24 to a smaller number
    getScore() {
        if (this.state.numGuesses <= 24) {
            return 100;
        } else {
            return 100 - (this.state.numGuesses - 24);
        }
    }

    isCompleted() {
        return _.reduce(this.state.isVisible, (m, n) => m && n);
    }

    copyCurrentState() {
        return {
            tiles: this.state.tiles.slice(),
            isVisible: this.state.isVisible.slice(),
            isClickable: this.state.isClickable.slice(),
            numGuesses: this.state.numGuesses,
            prevClickIndex: this.state.prevClickIndex,
            allowClick: this.state.allowClick
        }
    }
    //TODO: when each time handleClick called, it should only update the state once which means only one setState should
    // be called.
    handleClick(index) {
        if (this.state.allowClick && this.state.isClickable[index]) {
            console.log(this.copyCurrentState());
            let newState = this.copyCurrentState();
            console.log(newState);
            newState.isVisible[index] = true;
            newState.isClickable[index] = false;
            newState.numGuesses++;
            // first guess
            if (this.isFirstGuess()) {
                newState.prevClickIndex = index;
                this.setState(newState, () => {
                    console.log(this.state);
                });
            } else {
                // second guess
                if (this.state.tiles[index] === this.state.tiles[this.state.prevClickIndex]) {
                    newState.prevClickIndex = -1;
                    this.setState(newState, () => console.log(this.state));
                } else {
                    newState.allowClick = false;
                    this.setState(newState, ()=>console.log(this.state));
                    newState.isVisible[index] = false;
                    newState.isVisible[this.state.prevClickIndex] = false;
                    newState.isClickable[index] = true;
                    newState.isClickable[this.state.prevClickIndex] = true;
                    newState.allowClick = true;
                    newState.prevClickIndex = -1;
                    setTimeout(() => this.setState(newState, () => {
                        console.log(this.state)
                    }), 1000)
                }
            }

        }


    }

    render() {
        return (
            <div>
                <p className="title">Tile matching Game</p>
                <Status guess={this.state.numGuesses} score={this.getScore()} isFinished={this.isCompleted()}/>
                <div className="board">
                    {this.renderTiles(16)}
                </div>
                <Restart onRestartClick={() => this.reStart()}/>

            </div>
        )
    }
}

// this is function components, accept a single object argument with data and return a react element
// this function render a single tile as a button
// always start a component name with a capital letter
function Tile(props) {
    let {value, isVisible, onTileClick} = props;
    if (isVisible) {
        return (
            <button className="tile" onClick={onTileClick}>
                {value}
            </button>
        )
    } else {
        return (
            <button className="tile" onClick={onTileClick}>
                {}
            </button>
        )
    }
}

function Restart(props) {
    let {onRestartClick} = props;
    return (
        <button className="restart" onClick={onRestartClick}>
            Restart
        </button>
    )

}

// return the status. If game not complete, return number of guesses. Otherwise return guesses and score.
function Status(props) {
    let {guess, score, isFinished} = props;
    if (isFinished) {
        return (
            <p className="status">You win!!! Guess: {guess}, Score: {score}</p>
        )
    } else {
        return (
            <p className="status">Guess: {guess} </p>
        )
    }
}
