import React from "react";

export default class Modal extends React.Component {
    render () {
        if (!this.props.show) {
            return null;
        } else {
            return (
                <>
                    <div className='modal'>
                        <div className='modal-title'>{ this.props.title }</div>
                        <div>{ this.props.children }</div>
                    </div>
                </>
            );
        }
    }
}