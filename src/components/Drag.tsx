import React, { Component } from "react";
import { Draggable } from "react-drag-reorder";

class Drag extends Component {
    state = {
        words: ["Hello", "Hi", "How are you", "Cool"],
    };

    render() {
        // setInterval(() => {this.setState({words: ["asd"]}); console.log("CHANGE")}, 1000);
        return (
            <Draggable>
                {this.state.words.map((word, idx) => {
                    return (
                        <div key={idx} className="flex-item">
                            {word}
                        </div>
                    );
                })}
            </Draggable>
        );
    }
}

export default Drag;
